import { CommonModule } from '@angular/common'
import { Component, OnInit, inject, input, output, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'
import { ImageUploadComponent } from '@shared/components/image-upload/image-upload.component'
import {
  CreateProductRequest,
  ImageUpload,
  Product,
  UpdateProductRequest
} from '@shared/models/product.model'
import { firstValueFrom } from 'rxjs'
import { ProductService } from '../../services/product.service'

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageUploadComponent],
  template: `
    @if (isVisible()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        (click)="onCancel()"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-gray-900">
                {{
                  this.product()?.id
                    ? translate()?.editProduct
                    : translate()?.createProduct
                }}
              </h2>
            </div>

            <!-- Form Content -->
            <div class="px-6 py-4 space-y-6">
              <!-- Title -->
              <div>
                @let titleControl = productForm.get('title');

                <label class="form-label">
                  {{ translate()?.fields?.title?.label }} *
                </label>
                <input
                  type="text"
                  formControlName="title"
                  [placeholder]="translate()?.fields?.title?.placeholder"
                  class="form-input"
                  [class.border-red-300]="titleControl?.invalid && titleControl?.touched"
                />

                @if (titleControl?.invalid && titleControl?.touched) {
                  <div class="form-error">
                    @if (titleControl?.errors?.['required']) {
                      <span>{{ translate()?.validation?.titleRequired }}</span>
                    }
                    @if (titleControl?.errors?.['minlength']) {
                      <span>{{ translate()?.validation?.titleMinLength }}</span>
                    }
                  </div>
                }
              </div>

              <!-- Description -->
              <div>
                @let descriptionControl = productForm.get('description');

                <label class="form-label">
                  {{ translate()?.fields?.description?.label }} *
                </label>
                <textarea
                  formControlName="description"
                  [placeholder]="translate()?.fields?.description?.placeholder"
                  rows="3"
                  class="form-textarea"
                  [class.border-red-300]="
                    descriptionControl?.invalid && descriptionControl?.touched
                  "
                ></textarea>

                @if (descriptionControl?.invalid && descriptionControl?.touched) {
                  <div class="form-error">
                    @if (descriptionControl?.errors?.['required']) {
                      <span>{{ translate()?.validation?.descriptionRequired }}</span>
                    }

                    @if (descriptionControl?.errors?.['minlength']) {
                      <span>{{ translate()?.validation?.descriptionMinLength }}</span>
                    }
                  </div>
                }
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Price -->
                <div>
                  @let priceControl = productForm.get('price');

                  <label class="form-label"
                    >{{ translate()?.fields?.price?.label }} *</label
                  >
                  <div class="relative">
                    <span
                      class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      $
                    </span>

                    <input
                      type="number"
                      formControlName="price"
                      [placeholder]="translate()?.fields?.price?.placeholder"
                      step="0.01"
                      min="0"
                      class="form-input pl-8"
                      [class.border-red-300]="
                        priceControl?.invalid && priceControl?.touched
                      "
                    />
                  </div>

                  @if (priceControl?.invalid && priceControl?.touched) {
                    <div class="form-error">
                      @if (priceControl?.errors?.['required']) {
                        <span>{{ translate()?.validation?.priceRequired }}</span>
                      }

                      @if (priceControl?.errors?.['min']) {
                        <span>{{ translate()?.validation?.priceMin }}</span>
                      }
                    </div>
                  }
                </div>

                <!-- Stock -->
                <div>
                  @let stockControl = productForm.get('stock');

                  <label class="form-label"
                    >{{ translate()?.fields?.stock?.label }} *</label
                  >
                  <input
                    type="number"
                    formControlName="stock"
                    [placeholder]="translate()?.fields?.stock?.placeholder"
                    min="0"
                    class="form-input"
                    [class.border-red-300]="
                      stockControl?.invalid && stockControl?.touched
                    "
                  />
                  @if (stockControl?.invalid && stockControl?.touched) {
                    <div class="form-error">
                      @if (stockControl?.errors?.['required']) {
                        <span>{{ translate()?.validation?.stockRequired }}</span>
                      }

                      @if (stockControl?.errors?.['min']) {
                        <span>{{ translate()?.validation?.stockMin }}</span>
                      }
                    </div>
                  }
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Category -->
                <div>
                  @let categoryControl = productForm.get('category');

                  <label class="form-label"
                    >{{ translate()?.fields?.category?.label }} *</label
                  >
                  @if (categories().length > 0) {
                    <select
                      formControlName="category"
                      class="form-select"
                      [class.border-red-300]="
                        categoryControl?.invalid && categoryControl?.touched
                      "
                    >
                      <option hidden value="">
                        {{ translate()?.fields?.category?.placeholder }}
                      </option>

                      @for (category of categories(); track $index) {
                        <option [value]="category">
                          {{ category }}
                        </option>
                      }
                    </select>
                  } @else {
                    <input
                      type="text"
                      formControlName="category"
                      class="form-input"
                      [class.border-red-300]="
                        productForm.get('category')?.invalid &&
                        productForm.get('category')?.touched
                      "
                    />
                  }
                  @if (
                    categoryControl?.errors?.['required'] && categoryControl?.touched
                  ) {
                    <div class="form-error">
                      <span>{{ translate()?.validation?.categoryRequired }}</span>
                    </div>
                  }
                </div>

                <!-- Brand -->
                <div>
                  <label class="form-label">
                    {{ translate()?.fields?.brand?.label }}
                  </label>
                  <input
                    type="text"
                    formControlName="brand"
                    [placeholder]="translate()?.fields?.brand?.placeholder"
                    class="form-input"
                  />
                </div>
              </div>

              <!-- Images Upload -->
              <app-image-upload
                [images]="productImages()"
                (imagesChange)="productImages.set($event)"
              />
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button type="button" class="btn-secondary" (click)="onCancel()">
                {{ translate()?.generic?.cancel }}
              </button>

              <button
                type="submit"
                class="btn-primary"
                [disabled]="productForm.invalid || isSubmitting()"
              >
                @if (isSubmitting()) {
                  <div class="flex items-center space-x-2">
                    <div class="spinner w-4 h-4"></div>
                    <span>{{ translate()?.generic?.loading }}</span>
                  </div>
                } @else {
                  <span>{{ translate()?.generic?.save }}</span>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder)
  private readonly productService = inject(ProductService)
  private readonly translateService = inject(TranslateService)

  constructor() {
    // Listen for language changes
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(async (): Promise<void> => {
        await this.buildTranslate()
      })
  }

  public readonly product = input<Product | null>(null)
  public readonly isVisible = input<boolean>(false)
  public readonly saved = output<Product>()
  public readonly cancelled = output<void>()

  protected readonly categories = signal<string[]>([])
  protected readonly isSubmitting = signal<boolean>(false)
  protected readonly translate = signal<any>(null)
  protected readonly productImages = signal<ImageUpload[]>([])

  protected readonly productForm: FormGroup = this.buildForm()

  async ngOnInit(): Promise<void> {
    this.updateFormWithProduct()

    await this.buildTranslate()
    await this.loadCategories()
  }

  protected async onSubmit(): Promise<void> {
    if (this.productForm.invalid) {
      return this.productForm.markAllAsTouched()
    }

    this.isSubmitting.set(true)

    try {
      const formValue = this.productForm.value

      // Convert images to URLs
      const imageUrls: string[] = this.productImages().map((img: ImageUpload): string => {
        return img.url
      })

      const saveRequest: CreateProductRequest = {
        ...formValue,
        images: imageUrls
      }

      const id = this.product()?.id
      const save = id
        ? this.productService.updateProduct(id, saveRequest as UpdateProductRequest)
        : this.productService.createProduct(saveRequest)

      const savedProduct: Product | null = await firstValueFrom(save)

      if (savedProduct) {
        this.saved.emit(savedProduct)
      }
    } catch (error: unknown) {
      console.error('Error saving product:', error)
    } finally {
      this.isSubmitting.set(false)
    }
  }

  protected onCancel(): void {
    this.cancelled.emit()
  }

  private buildForm(): FormGroup {
    const form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      brand: ['']
    })

    return form
  }

  private updateFormWithProduct(): void {
    const product = this.product()

    this.productForm.patchValue({
      title: product?.title ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      category: product?.category ?? '',
      brand: product?.brand ?? ''
    })

    const images = product?.images?.map((url: string): ImageUpload => {
      return { url: url, file: null }
    })

    this.productImages.set(images ?? [])
  }

  private async buildTranslate(): Promise<void> {
    const location = 'pages.products'
    const translate = await firstValueFrom(this.translateService.get(location))
    const generic = await firstValueFrom(this.translateService.get('generic'))

    this.translate.set({ ...translate, generic })
  }

  private async loadCategories(): Promise<void> {
    try {
      const categories: string[] = await firstValueFrom(
        this.productService.getCategories()
      )
      this.categories.set(categories)
    } catch (error: unknown) {
      console.error('Error loading categories:', error)
    }
  }
}
