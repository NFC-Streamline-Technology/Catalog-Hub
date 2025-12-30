import { Component, OnInit, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  startWith,
} from "rxjs/operators";
import { firstValueFrom } from "rxjs";

import {
  Product,
  PaginationState,
  ProductsResponse,
} from "../../shared/models/product.model";
import { ProductService } from "../../core/services/product.service";
import { ProductFormComponent } from "./components/product-form/product-form.component";
import { ProductCardComponent } from "./components/product-card/product-card.component";
import { ConfirmDialogComponent } from "../../shared/components/confirm-dialog/confirm-dialog.component";
import { PaginationComponent } from "../../shared/components/pagination/pagination.component";

@Component({
  selector: "app-products",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProductFormComponent,
    ProductCardComponent,
    ConfirmDialogComponent,
    PaginationComponent,
  ],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              {{ translate?.title }}
            </h1>
            <p class="text-gray-600 mt-1">
              {{ translate?.subtitle }}
            </p>
            <div class="flex items-center space-x-4 mt-3 text-sm text-gray-500">
              <span>
                {{ translate?.total }}:
                <strong class="text-gray-900">
                  {{ paginationState().totalItems }}
                </strong>
                {{ translate?.products }}
              </span>
              <span>
                {{ translate?.page }}
                <strong class="text-gray-900">
                  {{ paginationState().currentPage }}
                </strong>
                {{ translate?.of }}
                <strong class="text-gray-900">
                  {{ paginationState().totalPages }}
                </strong>
              </span>
            </div>
          </div>

          <button
            class="btn-primary flex items-center space-x-2"
            (click)="openCreateForm()"
          >
            <span>➕</span>
            <span>{{ translate?.createProduct }}</span>
          </button>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <label class="form-label">{{ translate?.search }}</label>
            <div class="relative">
              <input
                type="text"
                [formControl]="searchControl"
                [placeholder]="translate?.searchPlaceholder"
                class="form-input w-full pl-10"
              />
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-400">🔍</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div *ngIf="filteredProducts().length > 0; else noProducts">
        <!-- Results Summary -->
        <div class="flex items-center justify-between mb-6">
          <p class="text-gray-600">
            {{ translate?.showing }} {{ getStartItem() }} - {{ getEndItem() }}
            {{ translate?.of }} {{ paginationState().totalItems }}
            {{ translate?.products }}
          </p>
          <div class="text-sm text-gray-500">
            {{ filteredProducts().length }} {{ translate?.productsOnPage }}
          </div>
        </div>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <app-product-card
            *ngFor="
              let product of filteredProducts();
              trackBy: trackByProductId
            "
            [product]="product"
            (edit)="openEditForm(product)"
            (delete)="openDeleteConfirm(product)"
          />
        </div>

        <!-- Pagination -->
        <!-- When the application language changes, this app-pagination component is destroyed and recreated by Angular so that all labels reflect the current locale. -->
        <div class="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <app-pagination
            [pagination]="paginationState()"
            (pageChanged)="onPageChanged($event)"
          />
        </div>
      </div>

      <ng-template #noProducts>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div class="text-center">
            <div class="text-gray-300 text-8xl mb-6">📦</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              {{ translate?.noProducts }}
            </h3>
            <p class="text-gray-600 mb-6">
              {{ translate?.noProductsDescription }}
            </p>
            <button class="btn-primary" (click)="openCreateForm()">
              <span class="mr-2">➕</span>
              {{ translate?.createFirstProduct }}
            </button>
          </div>
        </div>
      </ng-template>

      <!-- Product Form Modal -->
      <app-product-form
        *ngIf="showForm()"
        [product]="selectedProduct()"
        [isVisible]="showForm()"
        (saved)="onProductSaved($event)"
        (cancelled)="onFormCancelled()"
      />

      <!-- Delete Confirmation Dialog -->
      <app-confirm-dialog
        [isVisible]="showDeleteConfirm()"
        [message]="translate?.deleteConfirm ?? ''"
        (confirmed)="onDeleteConfirmed()"
        (cancelled)="onDeleteCancelled()"
      />
    </div>
  `,
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private translateService = inject(TranslateService);

  // Signals
  protected products = signal<Product[]>([]);
  protected filteredProducts = signal<Product[]>([]);
  protected showForm = signal<boolean>(false);
  protected showDeleteConfirm = signal<boolean>(false);
  protected selectedProduct = signal<Product | null>(null);
  protected translate: any;
  protected paginationState = signal<PaginationState>({
    currentPage: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0,
  });

  // Search state
  private currentSearchQuery = "";

  // Form controls
  protected searchControl = new FormControl("");

  async ngOnInit(): Promise<void> {
    await this.buildTranslate();
    await this.loadProducts();
    this.setupSearch();

    // Listen for language changes
    this.translateService.onLangChange.subscribe(() => {
      this.buildTranslate();
    });
  }

  private async buildTranslate(): Promise<void> {
    const location = "pages.products";
    const translate = await firstValueFrom(this.translateService.get(location));
    const generic = await firstValueFrom(this.translateService.get("generic"));

    this.translate = { ...translate, generic };
  }

  private async loadProducts(): Promise<void> {
    try {
      const pagination: PaginationState = this.paginationState();
      const skip: number = (pagination.currentPage - 1) * pagination.pageSize;

      const response: ProductsResponse = await firstValueFrom(
        this.productService.getProducts(
          this.currentSearchQuery,
          pagination.pageSize,
          skip
        )
      );

      this.filteredProducts.set(response.products);
      this.paginationState.set({
        ...pagination,
        totalItems: response.total,
        totalPages: Math.ceil(response.total / pagination.pageSize),
      });
    } catch (error: unknown) {
      console.error("Error loading products:", error);
    }
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        startWith(""),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query: string | null): Promise<void> => {
          const searchQuery: string = query?.trim() || "";
          this.currentSearchQuery = searchQuery;

          // Reset to first page when searching
          this.paginationState.update((state: PaginationState) => ({
            ...state,
            currentPage: 1,
          }));

          return this.loadProductsForSearch(searchQuery);
        })
      )
      .subscribe();
  }

  private async loadProductsForSearch(searchQuery: string): Promise<void> {
    try {
      const pagination: PaginationState = this.paginationState();
      const response: ProductsResponse = await firstValueFrom(
        this.productService.getProducts(searchQuery, pagination.pageSize, 0)
      );

      this.filteredProducts.set(response.products);
      this.paginationState.set({
        ...pagination,
        currentPage: 1,
        totalItems: response.total,
        totalPages: Math.ceil(response.total / pagination.pageSize),
      });
    } catch (error: unknown) {
      console.error("Error searching products:", error);
    }
  }

  protected openCreateForm(): void {
    this.selectedProduct.set(null);
    this.showForm.set(true);
  }

  protected openEditForm(product: Product): void {
    this.selectedProduct.set(product);
    this.showForm.set(true);
  }

  protected openDeleteConfirm(product: Product): void {
    this.selectedProduct.set(product);
    this.showDeleteConfirm.set(true);
  }

  protected async onProductSaved(product: Product): Promise<void> {
    this.showForm.set(false);
    this.selectedProduct.set(null);

    // Refresh products list
    await this.loadProducts();

    // Show success message (you could implement a toast service here)
    console.log("Product saved successfully");
  }

  protected onFormCancelled(): void {
    this.showForm.set(false);
    this.selectedProduct.set(null);
  }

  protected async onDeleteConfirmed(): Promise<void> {
    const product: Product | null = this.selectedProduct();
    if (product) {
      try {
        await firstValueFrom(this.productService.deleteProduct(product.id));

        // Remove from local state
        const currentProducts: Product[] = this.products();
        const updatedProducts: Product[] = currentProducts.filter(
          (item: Product): boolean => {
            return item.id !== item.id;
          }
        );
        this.products.set(updatedProducts);
        this.filteredProducts.set(updatedProducts);

        console.log("Product deleted successfully");
      } catch (error: unknown) {
        console.error("Error deleting product:", error);
      }
    }

    this.showDeleteConfirm.set(false);
    this.selectedProduct.set(null);
  }

  protected onDeleteCancelled(): void {
    this.showDeleteConfirm.set(false);
    this.selectedProduct.set(null);
  }

  protected trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  protected onPageChanged(page: number): void {
    this.paginationState.update((state) => ({ ...state, currentPage: page }));
    this.loadProducts();
  }

  protected getStartItem(): number {
    const pagination = this.paginationState();
    return (pagination.currentPage - 1) * pagination.pageSize + 1;
  }

  protected getEndItem(): number {
    const pagination = this.paginationState();
    const end = pagination.currentPage * pagination.pageSize;
    return Math.min(end, pagination.totalItems);
  }
}
