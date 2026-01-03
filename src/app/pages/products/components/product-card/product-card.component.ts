import { CommonModule } from '@angular/common'
import { Component, OnInit, inject, input, output, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { faBox, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { TranslateService } from '@ngx-translate/core'
import { Product } from '@shared/models/product.model'
import { ProductsTranslations } from '@shared/models/translate.model'
import { firstValueFrom } from 'rxjs'

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './product-card.component.html'
})
export class ProductCardComponent implements OnInit {
  private readonly translateService = inject(TranslateService)

  constructor() {
    // Listen for language changes
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(async (): Promise<void> => {
        await this.buildTranslate()
      })
  }

  public readonly product = input.required<Product>()
  public readonly edit = output<void>()
  public readonly delete = output<void>()

  protected readonly translate = signal<ProductsTranslations | null>(null)

  protected readonly icons = { faEdit, faTrash, faBox }

  async ngOnInit(): Promise<void> {
    await this.buildTranslate()
  }

  protected onEdit(): void {
    this.edit.emit()
  }

  protected onDelete(): void {
    this.delete.emit()
  }

  protected onImageError(event: Event): void {
    const target = event.target as HTMLImageElement
    target.src = 'https://cdn.dummyjson.com/error.webp'
  }

  protected getOriginalPrice(discountPercentage: number): number {
    const originalPrice = this.product().price / (1 - discountPercentage / 100)
    return originalPrice
  }

  protected getStockBadgeClass(): string {
    const stock = this.product().stock
    const defaultClass = 'text-white text-xs font-medium px-2 py-1 rounded-full'

    const stockConfig = [
      { condition: stock === 0, class: `bg-red-500 ${defaultClass}` },
      { condition: stock <= 10, class: `bg-yellow-500 ${defaultClass}` },
      { condition: stock > 10, class: `bg-green-500 ${defaultClass}` }
    ]

    const match = stockConfig.find((config): boolean => config.condition)

    return match?.class ?? ''
  }

  protected getStockText(): string {
    const translate = this.translate()?.stockStatus
    const stock = this.product().stock

    const stockConfig = [
      {
        condition: stock === 0,
        text: translate?.outOfStock
      },
      {
        condition: stock === 1,
        text: translate?.inStockSingle?.replace('{{stock}}', stock.toString())
      },
      {
        condition: stock <= 10,
        text: translate?.lowStock?.replace('{{stock}}', stock.toString())
      },
      { condition: stock >= 100, text: translate?.inStockPlus },
      {
        condition: stock > 10 && stock < 100,
        text: translate?.inStock?.replace('{{stock}}', stock.toString())
      }
    ]

    const match = stockConfig.find((config): boolean => config.condition)
    return match?.text ?? ''
  }

  private async buildTranslate(): Promise<void> {
    const location = 'pages.products'
    const translate = await firstValueFrom(this.translateService.get(location))
    const generic = await firstValueFrom(this.translateService.get('generic'))

    this.translate.set({ ...translate, generic })
  }
}
