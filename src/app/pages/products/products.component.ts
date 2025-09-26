import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, switchMap, startWith, combineLatest } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

import { Product, PaginationState } from '../../shared/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProductFormComponent,
    ProductCardComponent,
    ConfirmDialogComponent,
    PaginationComponent
  ],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              {{ translate?.title || 'Catálogo de Produtos' }}
            </h1>
            <p class="text-gray-600 mt-1">
              {{ translate?.subtitle || 'Gerencie seus produtos de forma simples e eficiente' }}
            </p>
            <div class="flex items-center space-x-4 mt-3 text-sm text-gray-500">
              <span>Total: <strong class="text-gray-900">{{ paginationState().totalItems }}</strong> produtos</span>
              <span>Página <strong class="text-gray-900">{{ paginationState().currentPage }}</strong> de <strong class="text-gray-900">{{ paginationState().totalPages }}</strong></span>
            </div>
          </div>
          
          <button 
            class="btn-primary flex items-center space-x-2"
            (click)="openCreateForm()"
          >
            <span>➕</span>
            <span>{{ translate?.createProduct || 'Criar Produto' }}</span>
          </button>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex flex-col lg:flex-row gap-4">
          <div class="flex-1">
            <label class="form-label">Pesquisar produtos</label>
            <div class="relative">
              <input
                type="text"
                [formControl]="searchControl"
                [placeholder]="translate?.searchPlaceholder || 'Pesquisar produtos...'"
                class="form-input w-full pl-10"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-400">🔍</span>
              </div>
            </div>
          </div>
          
          <div class="w-full lg:w-64">
            <label class="form-label">Filtrar por categoria</label>
            <select 
              [formControl]="categoryControl"
              class="form-input w-full"
            >
              <option value="all">Todas as categorias</option>
              <option *ngFor="let category of categories()" [value]="category">
                {{ formatCategoryName(category) }}
              </option>
            </select>
          </div>
          
          <!-- Clear Filters -->
          <div class="flex items-end">
            <button 
              *ngIf="hasActiveFilters()"
              (click)="clearAllFilters()"
              class="btn-secondary flex items-center space-x-2"
            >
              <span>🗑️</span>
              <span>Limpar Filtros</span>
            </button>
          </div>
        </div>
        
        <!-- Active Filters Display -->
        <div *ngIf="hasActiveFilters()" class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex flex-wrap gap-2">
            <span class="text-sm text-gray-600">Filtros ativos:</span>
            <div *ngIf="currentSearchQuery" 
                 class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Busca: "{{ currentSearchQuery }}"
              <button (click)="clearSearch()" class="ml-2 text-blue-600 hover:text-blue-800">×</button>
            </div>
            <div *ngIf="currentCategory && currentCategory !== 'all'" 
                 class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Categoria: {{ formatCategoryName(currentCategory) }}
              <button (click)="clearCategory()" class="ml-2 text-green-600 hover:text-green-800">×</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div *ngIf="filteredProducts().length > 0; else noProducts">
        <!-- Results Summary -->
        <div class="flex items-center justify-between mb-6">
          <p class="text-gray-600">
            Mostrando {{ getStartItem() }} - {{ getEndItem() }} de {{ paginationState().totalItems }} produtos
          </p>
          <div class="text-sm text-gray-500">
            {{ filteredProducts().length }} produtos na página atual
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <app-product-card
            *ngFor="let product of filteredProducts(); trackBy: trackByProductId"
            [product]="product"
            (edit)="openEditForm(product)"
            (delete)="openDeleteConfirm(product)"
          ></app-product-card>
        </div>
        
        <!-- Pagination -->
        <div class="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <app-pagination
            [pagination]="paginationState()"
            (pageChanged)="onPageChanged($event)"
          ></app-pagination>
        </div>
      </div>
      
      <ng-template #noProducts>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div class="text-center">
            <div class="text-gray-300 text-8xl mb-6">📦</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              {{ translate?.noProducts || 'Nenhum produto encontrado' }}
            </h3>
            <p class="text-gray-600 mb-6">
              Tente ajustar os termos de busca ou criar um novo produto para começar.
            </p>
            <button 
              class="btn-primary"
              (click)="openCreateForm()"
            >
              <span class="mr-2">➕</span>
              {{ translate?.createProduct || 'Criar Primeiro Produto' }}
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
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signals
  protected products = signal<Product[]>([]);
  protected filteredProducts = signal<Product[]>([]);
  protected categories = signal<string[]>([]);
  protected showForm = signal(false);
  protected showDeleteConfirm = signal(false);
  protected selectedProduct = signal<Product | null>(null);
  protected translate: any;
  protected paginationState = signal<PaginationState>({
    currentPage: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0
  });

  // Filter state
  protected currentSearchQuery = '';
  protected currentCategory = 'all';

  // Form controls
  protected searchControl = new FormControl('');
  protected categoryControl = new FormControl('all');

  async ngOnInit(): Promise<void> {
    await this.buildTranslate();
    await this.loadCategories();
    this.initializeFromQueryParams();
    this.setupFilters();

    // Listen for language changes
    this.translateService.onLangChange.subscribe(() => {
      this.buildTranslate();
    });
  }

  private initializeFromQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      const search = params['search'] || '';
      const category = params['category'] || 'all';
      const page = parseInt(params['page']) || 1;

      this.currentSearchQuery = search;
      this.currentCategory = category;
      
      this.searchControl.setValue(search, { emitEvent: false });
      this.categoryControl.setValue(category, { emitEvent: false });
      
      this.paginationState.update(state => ({ ...state, currentPage: page }));
      
      this.loadProducts();
    });
  }

  private setupFilters(): void {
    // Setup search filter
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.updateFilters({ search: query?.trim() || '' });
    });

    // Setup category filter
    this.categoryControl.valueChanges.pipe(
      startWith('all'),
      distinctUntilChanged()
    ).subscribe(category => {
      this.updateFilters({ category: category || 'all' });
    });
  }

  private updateFilters(filters: { search?: string, category?: string }): void {
    const queryParams: any = {};
    
    if (filters.search !== undefined) {
      this.currentSearchQuery = filters.search;
      if (filters.search) {
        queryParams.search = filters.search;
      }
    }
    
    if (filters.category !== undefined) {
      this.currentCategory = filters.category;
      if (filters.category && filters.category !== 'all') {
        queryParams.category = filters.category;
      }
    }

    // Reset to first page when filters change
    this.paginationState.update(state => ({ ...state, currentPage: 1 }));

    // Update URL with new query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  private async loadCategories(): Promise<void> {
    try {
      const categories = await firstValueFrom(this.productService.getCategories());
      this.categories.set(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  private async buildTranslate(): Promise<void> {
    const location = 'pages.products';
    const translate = await firstValueFrom(this.translateService.get(location));
    const generic = await firstValueFrom(this.translateService.get('generic'));

    this.translate = { ...translate, generic };
  }

  private async loadProducts(): Promise<void> {
    try {
      const pagination = this.paginationState();
      const skip = (pagination.currentPage - 1) * pagination.pageSize;
      
      const category = this.currentCategory === 'all' ? undefined : this.currentCategory;
      const searchQuery = this.currentSearchQuery || undefined;
      
      const response = await firstValueFrom(
        this.productService.getProducts(searchQuery, category, pagination.pageSize, skip)
      );
      
      this.filteredProducts.set(response.products);
      this.paginationState.set({
        ...pagination,
        totalItems: response.total,
        totalPages: Math.ceil(response.total / pagination.pageSize)
      });
    } catch (error) {
      console.error('Error loading products:', error);
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

  protected onPageChanged(page: number): void {
    this.paginationState.update(state => ({ ...state, currentPage: page }));
    
    // Update URL with new page
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page > 1 ? page : null },
      queryParamsHandling: 'merge'
    });
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

  // Filter helper methods
  protected formatCategoryName(category: string): string {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  protected hasActiveFilters(): boolean {
    return !!(this.currentSearchQuery || (this.currentCategory && this.currentCategory !== 'all'));
  }

  protected clearAllFilters(): void {
    this.searchControl.setValue('');
    this.categoryControl.setValue('all');
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  protected clearSearch(): void {
    this.searchControl.setValue('');
  }

  protected clearCategory(): void {
    this.categoryControl.setValue('all');
  }
}