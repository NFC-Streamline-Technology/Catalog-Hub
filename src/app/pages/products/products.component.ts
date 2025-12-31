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
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faBox, faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

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
    FontAwesomeModule,
  ],
  template: `
    <div class="space-y-8">
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
        </div>

        <button
          class="btn-primary flex items-center space-x-2"
          (click)="openCreateForm()"
        >
          <fa-icon [icon]="icons.faPlus" />
          <span>{{ translate?.createProduct }}</span>
        </button>
      </div>

      <div
        class="grid grid-cols-5 gap-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div class="flex flex-col sm:flex-row gap-4 col-span-4">
          <div class="flex-1">
            <div class="relative">
              <input
                type="text"
                [formControl]="searchControl"
                [placeholder]="translate?.searchPlaceholder"
                class="form-input w-full pl-10 h-10"
              />
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <fa-icon [icon]="icons.faSearch" class="text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 col-span-1">
          <fieldset
            [disabled]="true"
            class="flex items-center space-x-2 w-full"
          >
            <select [formControl]="categoryControl" class="form-select">
              <option value="">
                {{ translate?.allCategories }}
              </option>
              <option *ngFor="let category of categories()" [value]="category">
                {{ category }}
              </option>
            </select>
          </fieldset>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        @if(products().length) {
        <div class="flex items-center justify-between p-6">
          <p class="text-gray-600">
            {{ translate?.showing }} {{ getStartItem() }} - {{ getEndItem() }}
            {{ translate?.of }} {{ paginationState().totalItems }}
            {{ translate?.products }}
          </p>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <label>{{ translate?.totalItems }}</label>
            <fieldset class="w-20">
              <select [formControl]="pageSizeControl" class="form-select">
                <option value="8">8</option>
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="48">48</option>
              </select>
            </fieldset>
          </div>
        </div>
        }

        <hr />
        @if(paginationState().totalItems > 0) {
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6"
        >
          @for (product of products(); track product.id) {
          <app-product-card
            [product]="product"
            (edit)="openEditForm(product)"
            (delete)="openDeleteConfirm(product)"
          />
          }
        </div>

        } @else {
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div class="text-center">
            <fa-icon [icon]="icons.faBox" class="text-gray-300 text-8xl mb-6" />
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              {{ translate?.noProducts }}
            </h3>
            <p class="text-gray-600 mb-6">
              {{ translate?.noProductsDescription }}
            </p>
            <button class="btn-primary" (click)="openCreateForm()">
              <fa-icon [icon]="icons.faPlus" class="mr-2" />
              {{ translate?.createFirstProduct }}
            </button>
          </div>
        </div>
        }

        <hr />

        @if(showPaginationComponent()) {
        <app-pagination
          [pagination]="paginationState()"
          (pageChanged)="onPageChanged($event)"
        />
        }
      </div>

      <!-- Product Form Modal -->
      @if(showForm()) {
      <app-product-form
        [product]="selectedProduct()"
        [isVisible]="showForm()"
        (saved)="onProductSaved($event)"
        (cancelled)="onFormCancelled()"
      />
      }

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
  constructor() {
    this.setupSearch();
    this.setupPageSizeChange();

    // Listen for language changes
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(async (): Promise<void> => {
        await this.buildTranslate();
      });
  }

  private productService = inject(ProductService);
  private translateService = inject(TranslateService);

  // Signals
  protected readonly categories = signal<string[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly showForm = signal<boolean>(false);
  protected readonly showPaginationComponent = signal<boolean>(true);
  protected readonly showDeleteConfirm = signal<boolean>(false);
  protected readonly selectedProduct = signal<Product | null>(null);
  protected readonly paginationState = signal<PaginationState>({
    currentPage: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0,
  });

  protected translate: any;
  protected readonly icons = { faPlus, faSearch, faBox };

  // Search state
  protected readonly searchControl = new FormControl<string>("");
  protected readonly categoryControl = new FormControl<string>("");
  protected readonly pageSizeControl = new FormControl<number>(
    this.paginationState().pageSize
  );

  async ngOnInit(): Promise<void> {
    await this.buildTranslate();
    await this.loadProducts();
  }

  private async buildTranslate(): Promise<void> {
    const location = "pages.products";
    const translate = await firstValueFrom(this.translateService.get(location));
    const generic = await firstValueFrom(this.translateService.get("generic"));

    this.translate = { ...translate, generic };
  }

  private async loadProducts(searching: boolean = false): Promise<void> {
    try {
      const pagination: PaginationState = this.paginationState();
      const skip: number = (pagination.currentPage - 1) * pagination.pageSize;
      const getProducts = this.productService.getProducts(
        this.searchControl.value?.trim() || "",
        pagination.pageSize,
        searching ? 0 : skip
      );

      const response: ProductsResponse = await firstValueFrom(getProducts);
      this.products.set(response.products);
      this.paginationState.update((state): PaginationState => {
        return {
          ...state,
          currentPage: searching ? 1 : state.currentPage,
          totalItems: response.total,
          totalPages: Math.ceil(response.total / state.pageSize),
        };
      });
    } catch (error: unknown) {
      console.error("Error searching products:", error);
    }
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        startWith(""),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((): Promise<void> => {
          this.resetPagination();

          return this.loadProducts(true);
        })
      )
      .pipe(takeUntilDestroyed())
      .subscribe();
  }

  private setupPageSizeChange(): void {
    const statePageSize = this.paginationState().pageSize;
    this.pageSizeControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((pageSize: number | null): void => {
        this.paginationState.update(
          (state): PaginationState => ({
            ...state,
            pageSize: pageSize ?? statePageSize,
            currentPage: 1,
          })
        );

        this.loadProducts();
      });
  }

  private resetPagination(): void {
    this.paginationState.update(
      (state: PaginationState): PaginationState => ({
        ...state,
        currentPage: 1,
      })
    );
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
        console.log("Product deleted successfully");

        await this.loadProducts();
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

  protected async onPageChanged(page: number): Promise<void> {
    this.paginationState.update((state): PaginationState => {
      return { ...state, currentPage: page };
    });

    await this.loadProducts();
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
