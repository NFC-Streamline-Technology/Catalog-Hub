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
import { ProductsTranslations } from '@shared/models/translate.model'
import { firstValueFrom } from 'rxjs'
import { ProductService } from '../../services/product.service'

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageUploadComponent],
  templateUrl: './product-form.component.html'
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
  protected readonly translate = signal<ProductsTranslations | null>(null)
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
