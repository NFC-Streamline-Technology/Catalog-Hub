import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { faBox, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { TranslateService } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'
import { Product } from '../../../../shared/models/product.model'

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div
      class="card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
    >
      <!-- Product Image -->
      <div class="relative overflow-hidden rounded-lg mb-4">
        @if (product.thumbnail) {
          <img
            [src]="product.thumbnail"
            [alt]="product.title"
            class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            (error)="onImageError($event)"
          />
        } @else {
          <div
            class="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
          >
            <fa-icon [icon]="icons.faBox" class="text-gray-400 text-4xl" />
          </div>
        }

        <!-- Discount Badge -->
        @if (product.discountPercentage && product.discountPercentage > 0) {
          <div
            class="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
          >
            -{{ product.discountPercentage.toFixed(0) }}%
          </div>
        }

        <!-- Stock Badge -->
        <div class="absolute top-2 right-2">
          <span [class]="getStockBadgeClass()">
            {{ getStockText() }}
          </span>
        </div>
      </div>

      <!-- Product Info -->
      <div class="space-y-3">
        <!-- Title and Category -->
        <div>
          <h3 class="font-semibold text-gray-900 line-clamp-2 text-lg">
            {{ product.title }}
          </h3>
          <p class="text-sm text-gray-600 line-clamp-2 mt-1">
            {{ product.description }}
          </p>
        </div>

        <!-- Price -->
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <div class="flex items-baseline space-x-2">
              <span class="text-2xl font-bold text-gray-900">
                {{ getPriceDisplay(product.price) }}
              </span>
              @if (product.discountPercentage && product.discountPercentage > 0) {
                <span class="text-sm text-gray-500 line-through">
                  {{ getOriginalPrice(product.price, product.discountPercentage) }}
                </span>
              }
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex space-x-2 pt-3 border-gray-100">
          <button
            class="btn-primary flex-1 text-sm transition-all duration-200 hover:scale-105"
            (click)="onEdit()"
          >
            <fa-icon [icon]="icons.faEdit" class="mr-1" />
            {{ translate?.generic?.edit }}
          </button>
          <button
            class="btn-danger flex-1 text-sm transition-all duration-200 hover:scale-105"
            (click)="onDelete()"
          >
            <fa-icon [icon]="icons.faTrash" class="mr-1" />
            {{ translate?.generic?.delete }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `
  ]
})
export class ProductCardComponent implements OnInit {
  constructor() {
    // Listen for language changes
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(async (): Promise<void> => {
        await this.buildTranslate()
      })
  }

  @Input({ required: true }) product!: Product
  @Output() edit = new EventEmitter<void>()
  @Output() delete = new EventEmitter<void>()

  protected readonly icons = { faEdit, faTrash, faBox }

  protected translate: any

  private translateService = inject(TranslateService)

  async ngOnInit(): Promise<void> {
    await this.buildTranslate()
  }

  private async buildTranslate(): Promise<void> {
    const location = 'pages.products'
    const translate = await firstValueFrom(this.translateService.get(location))
    const generic = await firstValueFrom(this.translateService.get('generic'))

    this.translate = { ...translate, generic }
  }

  protected onEdit(): void {
    this.edit.emit()
  }

  protected onDelete(): void {
    this.delete.emit()
  }

  protected onImageError(event: Event): void {
    const target = event.target as HTMLImageElement
    target.style.display = 'none'
  }

  protected getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0)
  }

  protected getPriceDisplay(price: number): string {
    return `$${price.toFixed(2)}`
  }

  protected getOriginalPrice(price: number, discountPercentage: number): string {
    const originalPrice = price / (1 - discountPercentage / 100)
    return `$${originalPrice.toFixed(2)}`
  }

  protected getStockBadgeClass(): string {
    const stock = this.product.stock
    if (stock === 0) {
      return 'bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full'
    } else if (stock <= 10) {
      return 'bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full'
    } else {
      return 'bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full'
    }
  }

  protected getStockText(): string {
    const translate = this.translate?.stockStatus
    const stock = this.product.stock

    const stockConfig = [
      { condition: stock === 0, text: translate?.outOfStock },
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
}
