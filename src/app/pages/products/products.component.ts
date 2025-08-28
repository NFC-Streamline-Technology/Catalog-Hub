import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

import { Product } from '../../shared/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProductFormComponent,
    ProductCardComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ translate?.title || 'Catálogo de Produtos' }}
          </h1>
          <p class="text-gray-600 mt-1">
            {{ translate?.subtitle || 'Gerencie seus produtos de forma simples e eficiente' }}
          </p>
        </div>
        
        <button 
          class="btn-primary"
          (click)="openCreateForm()"
        >
          {{ translate?.createProduct || 'Criar Produto' }}
        </button>
      </div>

      <!-- Search -->
      <div class="max-w-md">
        <input
          type="text"
          [formControl]="searchControl"
          [placeholder]="translate?.searchPlaceholder || 'Pesquisar produtos...'"
          class="form-input w-full"
        />
      </div>

      <!-- Products Grid -->
      <div *ngIf="filteredProducts().length > 0; else noProducts">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <app-product-card
            *ngFor="let product of filteredProducts(); trackBy: trackByProductId"
            [product]="product"
            (edit)="openEditForm(product)"
            (delete)="openDeleteConfirm(product)"
          ></app-product-card>
        </div>
      </div>
      <ng-template #noProducts>
        <div class="text-center py-12">
          <div class="text-gray-400 text-6xl mb-4">📦</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{ translate?.noProducts || 'Nenhum produto encontrado' }}
          </h3>
          <p class="text-gray-500">
            Tente ajustar os termos de busca ou criar um novo produto.
          </p>
        </div>
      </ng-template>

      <!-- Product Form Modal -->
      <app-product-form
        *ngIf="showForm()"
        [product]="selectedProduct()"
        [isVisible]="showForm()"
        (saved)="onProductSaved($event)"
        (cancelled)="onFormCancelled()"
      ></app-product-form>

      <!-- Delete Confirmation Dialog -->
      <app-confirm-dialog
        [isVisible]="showDeleteConfirm()"
        [message]="translate?.deleteConfirm || 'Tem certeza que deseja excluir este produto?'"
        (confirmed)="onDeleteConfirmed()"
        (cancelled)="onDeleteCancelled()"
      ></app-confirm-dialog>
    </div>
  `
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private translateService = inject(TranslateService);

  // Signals
  protected products = signal<Product[]>([]);
  protected filteredProducts = signal<Product[]>([]);
  protected showForm = signal(false);
  protected showDeleteConfirm = signal(false);
  protected selectedProduct = signal<Product | null>(null);
  protected translate: any;

  // Form controls
  protected searchControl = new FormControl('');

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
    const location = 'pages.products';
    const translate = await firstValueFrom(this.translateService.get(location));
    const generic = await firstValueFrom(this.translateService.get('generic'));

    this.translate = { ...translate, generic };
  }

  private async loadProducts(): Promise<void> {
    try {
      const products = await firstValueFrom(this.productService.getProducts());
      this.products.set(products);
      this.filteredProducts.set(products);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        const searchQuery = query?.trim() || '';
        if (searchQuery) {
          return this.productService.getProducts(searchQuery);
        } else {
          return this.productService.getProducts();
        }
      })
    ).subscribe(products => {
      this.filteredProducts.set(products);
    });
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
    console.log('Product saved successfully');
  }

  protected onFormCancelled(): void {
    this.showForm.set(false);
    this.selectedProduct.set(null);
  }

  protected async onDeleteConfirmed(): Promise<void> {
    const product = this.selectedProduct();
    if (product) {
      try {
        await firstValueFrom(this.productService.deleteProduct(product.id));
        
        // Remove from local state
        const currentProducts = this.products();
        const updatedProducts = currentProducts.filter(p => p.id !== product.id);
        this.products.set(updatedProducts);
        this.filteredProducts.set(updatedProducts);
        
        console.log('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
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
}