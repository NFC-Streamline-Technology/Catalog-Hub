import { CommonModule } from '@angular/common'
import { Component, OnInit, inject, input, output, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { TranslateService } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'
import { ImageUpload } from '../../models/product.model'

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.component.html'
})
export class ImageUploadComponent implements OnInit {
  constructor() {
    // Listen for language changes
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(async (): Promise<void> => {
        await this.buildTranslate()
      })
  }

  private readonly translateService = inject(TranslateService)

  public readonly images = input<ImageUpload[]>([])
  public readonly maxImages = input<number>(5)
  public readonly maxSizePerImage = input<number>(10 * 1024 * 1024) // 10MB
  public readonly imagesChange = output<ImageUpload[]>()

  protected readonly translate = signal<any>(null)
  protected readonly dragOver = signal<boolean>(false)
  protected readonly errorMessage = signal<string>('')

  async ngOnInit(): Promise<void> {
    await this.buildTranslate()
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault()
    this.dragOver.set(true)
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault()
    this.dragOver.set(false)
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault()
    this.dragOver.set(false)

    const files = Array.from(event.dataTransfer?.files || [])
    this.handleFiles(files)
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    const files = Array.from(input.files || [])
    this.handleFiles(files)
    input.value = '' // Reset input
  }

  protected addImageByUrl(url: string): void {
    if (!url.trim()) return

    this.errorMessage.set('')

    if (this.images().length >= this.maxImages()) {
      const translate = this.translate()?.errors?.maxImagesReached
      const message = translate.replace('{{max}}', this.maxImages().toString())
      this.errorMessage.set(message)
      return
    }

    if (!this.isValidImageUrl(url)) {
      this.errorMessage.set(this.translate()?.errors?.invalidImageUrl)
      return
    }

    const imageUpload: ImageUpload = {
      file: null,
      url: url
    }

    const images: ImageUpload[] = [...this.images(), imageUpload]
    this.imagesChange.emit(images)
  }

  protected removeImage(index: number): void {
    const images: ImageUpload[] = this.images().filter(
      (_: ImageUpload, i: number): boolean => i !== index
    )
    this.imagesChange.emit(images)
  }

  private async buildTranslate(): Promise<void> {
    const location = 'pages.products'
    const translate = await firstValueFrom(this.translateService.get(location))
    const generic = await firstValueFrom(this.translateService.get('generic'))

    this.translate.set({ ...translate, generic })
  }

  private handleFiles(files: File[]): void {
    this.errorMessage.set('')
    if (this.images().length + files.length > this.maxImages()) {
      const translate = this.translate()?.errors?.maxImagesReached
      const message = translate.replace('{{max}}', this.maxImages().toString())
      this.errorMessage.set(message)
      return
    }

    files.forEach((file: File): void => {
      if (!file.type.startsWith('image/')) {
        this.errorMessage.set(this.translate()?.errors?.onlyImageFiles)
        return
      }

      if (file.size > this.maxSizePerImage()) {
        const translate = this.translate()?.errors?.fileTooLarge
        const formatFileSize = this.formatFileSize(this.maxSizePerImage())

        this.errorMessage.set(translate.replace('{{max}}', formatFileSize))
        return
      }

      this.addImageFile(file)
    })
  }

  private addImageFile(file: File): void {
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>): void => {
      const imageUpload: ImageUpload = {
        file: file,
        url: e.target?.result as string
      }

      const images: ImageUpload[] = [...this.images(), imageUpload]
      this.imagesChange.emit(images)
    }
    reader.readAsDataURL(file)
  }

  private isValidImageUrl(url: string): boolean {
    try {
      new URL(url)
      return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url)
    } catch {
      return false
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB']
    const i: number = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}
