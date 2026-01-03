import { CommonModule } from '@angular/common'
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  inject,
  signal
} from '@angular/core'
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
    @if (isVisible) {
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
                {{ isEditMode() ? translate?.editProduct : translate?.createProduct }}
              </h2>
            </div>

            <!-- Form Content -->
            <div class="px-6 py-4 space-y-6">
              <!-- Title -->
              <div>
                @let titleControl = productForm.get('title');

                <label class="form-label">{{ translate?.fields?.title }} *</label>
                <input
                  type="text"
                  formControlName="title"
                  class="form-input"
                  [class.border-red-300]="titleControl?.invalid && titleControl?.touched"
                />

                @if (titleControl?.invalid && titleControl?.touched) {
                  <div class="form-error">
                    @if (titleControl?.errors?.['required']) {
                      <span>{{ translate?.validation?.titleRequired }}</span>
                    }
                    @if (titleControl?.errors?.['minlength']) {
                      <span>{{ translate?.validation?.titleMinLength }}</span>
                    }
                  </div>
                }
              </div>

              <!-- Description -->
              <div>
                @let descriptionControl = productForm.get('description');

                <label class="form-label">{{ translate?.fields?.description }} *</label>
                <textarea
                  formControlName="description"
                  rows="3"
                  class="form-textarea"
                  [class.border-red-300]="
                    descriptionControl?.invalid && descriptionControl?.touched
                  "
                ></textarea>

                @if (descriptionControl?.invalid && descriptionControl?.touched) {
                  <div class="form-error">
                    @if (descriptionControl?.errors?.['required']) {
                      <span>{{ translate?.validation?.descriptionRequired }}</span>
                    }

                    @if (descriptionControl?.errors?.['minlength']) {
                      <span>{{ translate?.validation?.descriptionMinLength }}</span>
                    }
                  </div>
                }
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Price -->
                <div>
                  @let priceControl = productForm.get('price');

                  <label class="form-label">{{ translate?.fields?.price }} *</label>
                  <div class="relative">
                    <span
                      class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      $
                    </span>
                    <input
                      type="number"
                      formControlName="price"
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
                        <span>{{ translate?.validation?.priceRequired }}</span>
                      }

                      @if (priceControl?.errors?.['min']) {
                        <span>{{ translate?.validation?.priceMin }}</span>
                      }
                    </div>
                  }
                </div>

                <!-- Stock -->
                <div>
                  @let stockControl = productForm.get('stock');

                  <label class="form-label">{{ translate?.fields?.stock }} *</label>
                  <input
                    type="number"
                    formControlName="stock"
                    min="0"
                    class="form-input"
                    [class.border-red-300]="
                      stockControl?.invalid && stockControl?.touched
                    "
                  />
                  @if (stockControl?.invalid && stockControl?.touched) {
                    <div class="form-error">
                      @if (stockControl?.errors?.['required']) {
                        <span>{{ translate?.validation?.stockRequired }}</span>
                      }

                      @if (stockControl?.errors?.['min']) {
                        <span>{{ translate?.validation?.stockMin }}</span>
                      }
                    </div>
                  }
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Category -->
                <div>
                  @let categoryControl = productForm.get('category');

                  <label class="form-label">{{ translate?.fields?.category }} *</label>
                  @if (categories().length > 0) {
                    <select
                      formControlName="category"
                      class="form-select"
                      [class.border-red-300]="
                        categoryControl?.invalid && categoryControl?.touched
                      "
                    >
                      <option hidden value="">
                        {{ translate?.fields?.selectCategory }}
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
                      <span>{{ translate?.validation?.categoryRequired }}</span>
                    </div>
                  }
                </div>

                <!-- Brand -->
                <div>
                  <label class="form-label">
                    {{ translate?.fields?.brand }}
                  </label>
                  <input type="text" formControlName="brand" class="form-input" />
                </div>
              </div>

              <!-- Images Upload -->
              <app-image-upload
                [images]="productImages"
                (imagesChange)="onImagesChange($event)"
              />
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button type="button" class="btn-secondary" (click)="onCancel()">
                {{ translate?.generic?.cancel }}
              </button>

              <button
                type="submit"
                class="btn-primary"
                [disabled]="productForm.invalid || isSubmitting()"
              >
                @if (isSubmitting()) {
                  <div class="flex items-center space-x-2">
                    <div class="spinner w-4 h-4"></div>
                    <span>{{ translate?.generic?.loading }}</span>
                  </div>
                } @else {
                  <span>{{ translate?.generic?.save }}</span>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ProductFormComponent implements OnInit, OnChanges {
  constructor() {
    // Listen for language changes
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(async (): Promise<void> => {
        await this.buildTranslate()
      })
  }

  @Input() product: Product | null = null
  @Input() isVisible = false
  @Output() saved = new EventEmitter<Product>()
  @Output() cancelled = new EventEmitter<void>()

  private readonly fb = inject(FormBuilder)
  private readonly productService = inject(ProductService)
  private readonly translateService = inject(TranslateService)

  protected readonly categories = signal<string[]>([])
  protected readonly isSubmitting = signal<boolean>(false)

  protected productForm!: FormGroup
  protected translate: any
  protected productImages: ImageUpload[] = []

  async ngOnInit(): Promise<void> {
    this.initializeForm()

    await this.buildTranslate()
    await this.loadCategories()
  }

  ngOnChanges(): void {
    if (this.productForm) {
      this.updateFormWithProduct()
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
    })

    this.updateFormWithProduct()
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
      })

      // Set product images
      this.productImages = []
      if (this.product.images && this.product.images.length > 0) {
        this.productImages = this.product.images.map(
          (url: string): ImageUpload => ({
            url: url,
            file: null
          })
        )
      } else if (this.product.thumbnail) {
        this.productImages = [
          {
            url: this.product.thumbnail,
            file: null
          }
        ]
      }
    } else {
      this.productForm.reset({
        title: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        brand: ''
      })
      this.productImages = []
    }
  }

  private async buildTranslate(): Promise<void> {
    const location = 'pages.products'
    const translate = await firstValueFrom(this.translateService.get(location))
    const generic = await firstValueFrom(this.translateService.get('generic'))

    this.translate = { ...translate, generic }
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

  protected isEditMode(): boolean {
    return this.product !== null
  }

  protected async onSubmit(): Promise<void> {
    if (this.productForm.invalid) {
      Object.keys(this.productForm.controls).forEach((key: string) => {
        this.productForm.get(key)?.markAsTouched()
      })
      return
    }

    this.isSubmitting.set(true)

    try {
      const formValue = this.productForm.value

      // Convert images to URLs
      const imageUrls: string[] = this.productImages.map((img: ImageUpload): string => {
        return img.url
      })

      if (this.isEditMode()) {
        const updateRequest: UpdateProductRequest = {
          ...formValue,
          images: imageUrls
        }

        const updatedProduct: Product | null = await firstValueFrom(
          this.productService.updateProduct(this.product!.id, updateRequest)
        )

        if (updatedProduct) {
          this.saved.emit(updatedProduct)
        }
      } else {
        const createRequest: CreateProductRequest = {
          ...formValue,
          images: imageUrls
        }

        const newProduct: Product | null = await firstValueFrom(
          this.productService.createProduct(createRequest)
        )

        if (newProduct) {
          this.saved.emit(newProduct)
        }
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

  protected onImagesChange(images: ImageUpload[]): void {
    this.productImages = images
  }
}
