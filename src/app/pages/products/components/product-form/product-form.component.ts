import { Component, Input, Output, EventEmitter, OnInit, OnChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { Product, CreateProductRequest, UpdateProductRequest, ImageUpload } from '../../../../shared/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { ImageUploadComponent } from '../../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div *ngIf="isVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" (click)="onCancel()">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">
              {{ isEditMode() ? (translate?.editProduct || 'Editar Produto') : (translate?.createProduct || 'Criar Produto') }}
            </h2>
          </div>

          <!-- Form Content -->
          <div class="px-6 py-4 space-y-6">
            <!-- Title -->
            <div>
              <label class="form-label">
                {{ translate?.fields?.title || 'Título' }} *
              </label>
              <input
                type="text"
                formControlName="title"
                class="form-input"
                [class.border-red-300]="productForm.get('title')?.invalid && productForm.get('title')?.touched"
              />
              <div *ngIf="productForm.get('title')?.invalid && productForm.get('title')?.touched" class="form-error">
                <div *ngIf="productForm.get('title')?.errors?.['required']">
                  {{ translate?.validation?.titleRequired || 'Título é obrigatório' }}
                </div>
                <div *ngIf="productForm.get('title')?.errors?.['minlength']">
                  {{ translate?.validation?.titleMinLength || 'Título deve ter pelo menos 3 caracteres' }}
                </div>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="form-label">
                {{ translate?.fields?.description || 'Descrição' }} *
              </label>
              <textarea
                formControlName="description"
                rows="3"
                class="form-textarea"
                [class.border-red-300]="productForm.get('description')?.invalid && productForm.get('description')?.touched"
              ></textarea>
              <div *ngIf="productForm.get('description')?.invalid && productForm.get('description')?.touched" class="form-error">
                <div *ngIf="productForm.get('description')?.errors?.['required']">
                  {{ translate?.validation?.descriptionRequired || 'Descrição é obrigatória' }}
                </div>
                <div *ngIf="productForm.get('description')?.errors?.['minlength']">
                  {{ translate?.validation?.descriptionMinLength || 'Descrição deve ter pelo menos 10 caracteres' }}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Price -->
              <div>
                <label class="form-label">
                  {{ translate?.fields?.price || 'Preço' }} *
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    formControlName="price"
                    step="0.01"
                    min="0"
                    class="form-input pl-8"
                    [class.border-red-300]="productForm.get('price')?.invalid && productForm.get('price')?.touched"
                  />
                </div>
                <div *ngIf="productForm.get('price')?.invalid && productForm.get('price')?.touched" class="form-error">
                  <div *ngIf="productForm.get('price')?.errors?.['required']">
                    {{ translate?.validation?.priceRequired || 'Preço é obrigatório' }}
                  </div>
                  <div *ngIf="productForm.get('price')?.errors?.['min']">
                    {{ translate?.validation?.priceMin || 'Preço deve ser maior que 0' }}
                  </div>
                </div>
              </div>

              <!-- Stock -->
              <div>
                <label class="form-label">
                  {{ translate?.fields?.stock || 'Estoque' }} *
                </label>
                <input
                  type="number"
                  formControlName="stock"
                  min="0"
                  class="form-input"
                  [class.border-red-300]="productForm.get('stock')?.invalid && productForm.get('stock')?.touched"
                />
                <div *ngIf="productForm.get('stock')?.invalid && productForm.get('stock')?.touched" class="form-error">
                  <div *ngIf="productForm.get('stock')?.errors?.['required']">
                    {{ translate?.validation?.stockRequired || 'Estoque é obrigatório' }}
                  </div>
                  <div *ngIf="productForm.get('stock')?.errors?.['min']">
                    {{ translate?.validation?.stockMin || 'Estoque deve ser maior ou igual a 0' }}
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Category -->
              <div>
                <label class="form-label">
                  {{ translate?.fields?.category || 'Categoria' }} *
                </label>
                <select
                  *ngIf="categories().length > 0; else categoryInput"
                  formControlName="category"
                  class="form-input"
                  [class.border-red-300]="productForm.get('category')?.invalid && productForm.get('category')?.touched"
                >
                  <option value="">Selecione uma categoria</option>
                  <option *ngFor="let category of categories()" [value]="category" class="capitalize">
                    {{ category }}
                  </option>
                </select>
                <ng-template #categoryInput>
                  <input
                    type="text"
                    formControlName="category"
                    class="form-input"
                    [class.border-red-300]="productForm.get('category')?.invalid && productForm.get('category')?.touched"
                  />
                </ng-template>
                <div *ngIf="productForm.get('category')?.invalid && productForm.get('category')?.touched" class="form-error">
                  <div *ngIf="productForm.get('category')?.errors?.['required']">
                    {{ translate?.validation?.categoryRequired || 'Categoria é obrigatória' }}
                  </div>
                </div>
              </div>

              <!-- Brand -->
              <div>
                <label class="form-label">
                  {{ translate?.fields?.brand || 'Marca' }}
                </label>
                <input
                  type="text"
                  formControlName="brand"
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              class="btn-secondary"
              (click)="onCancel()"
            >
              {{ translate?.generic?.cancel || 'Cancelar' }}
            </button>
            <button
              type="submit"
              class="btn-primary"
              [disabled]="productForm.invalid || isSubmitting()"
            >
              <div *ngIf="isSubmitting(); else saveText" class="flex items-center space-x-2">
                <div class="spinner w-4 h-4"></div>
                <span>{{ translate?.generic?.loading || 'Carregando...' }}</span>
              </div>
              <ng-template #saveText>
                {{ translate?.generic?.save || 'Salvar' }}
              </ng-template>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProductFormComponent implements OnInit, OnChanges {
  @Input() product: Product | null = null;
  @Input() isVisible = false;
  @Output() saved = new EventEmitter<Product>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private translateService = inject(TranslateService);

  protected productForm!: FormGroup;
  protected categories = signal<string[]>([]);
  protected isSubmitting = signal(false);
  protected translate: any;

  ngOnInit(): void {
    this.initializeForm();
    this.buildTranslate();
    this.loadCategories();

    // Listen for language changes
    this.translateService.onLangChange.subscribe(() => {
      this.buildTranslate();
    });
  }

  ngOnChanges(): void {
    if (this.productForm) {
      this.updateFormWithProduct();
    }
  }

  private initializeForm(): void {
    this.productForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      brand: ['']
    });

    this.updateFormWithProduct();
  }

  private updateFormWithProduct(): void {
    if (this.product) {
      this.productForm.patchValue({
        title: this.product.title,
        description: this.product.description,
        price: this.product.price,
        stock: this.product.stock,
        category: this.product.category,
        brand: this.product.brand || ''
      });
    } else {
      this.productForm.reset({
        title: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        brand: ''
      });
    }
  }

  private async buildTranslate(): Promise<void> {
    const location = 'pages.products';
    const translate = await firstValueFrom(this.translateService.get(location));
    const generic = await firstValueFrom(this.translateService.get('generic'));

    this.translate = { ...translate, generic };
  }

  private async loadCategories(): Promise<void> {
    try {
      const categories = await firstValueFrom(this.productService.getCategories());
      this.categories.set(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  protected isEditMode(): boolean {
    return this.product !== null;
  }

  protected async onSubmit(): Promise<void> {
    if (this.productForm.invalid) {
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formValue = this.productForm.value;
      
      if (this.isEditMode()) {
        const updateRequest: UpdateProductRequest = {
          id: this.product!.id,
          ...formValue
        };
        const updatedProduct = await firstValueFrom(this.productService.updateProduct(updateRequest));
        if (updatedProduct) {
          this.saved.emit(updatedProduct);
        }
      } else {
        const createRequest: CreateProductRequest = formValue;
        const newProduct = await firstValueFrom(this.productService.createProduct(createRequest));
        if (newProduct) {
          this.saved.emit(newProduct);
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }
}