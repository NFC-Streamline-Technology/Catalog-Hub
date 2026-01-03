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
  template: `
    <div
      class="card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
    >
      <!-- Product Image -->
      <div class="relative overflow-hidden rounded-lg mb-4">
        @if (product().thumbnail) {
          <img
            [src]="product().thumbnail"
            [alt]="product().title"
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
        @let discountPercentage = product().discountPercentage;
        @if (discountPercentage) {
          <div
            class="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
          >
            @let fixedPercentage = discountPercentage < 1 ? 2 : 0;
            -{{ discountPercentage.toFixed(fixedPercentage) }}%
          </div>
        }

        <!-- Stock Badge -->
        <div class="absolute top-2 right-2">
          <span [class]="getStockBadgeClass()">{{ getStockText() }}</span>
        </div>
      </div>

      <!-- Product Info -->
      <div class="space-y-3">
        <!-- Title and Category -->
        <div>
          <h3 class="font-semibold text-gray-900 line-clamp-1 text-lg">
            {{ product().title }}
          </h3>
          <p class="text-sm text-gray-600 line-clamp-2 mt-1">
            {{ product().description }}
          </p>
        </div>

        <!-- Price -->
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <div class="flex items-baseline space-x-2">
              <span class="text-2xl font-bold text-gray-900">
                {{ product().price | currency: 'USD' : 'symbol' : '1.2-2' }}
              </span>

              @if (discountPercentage) {
                <span class="text-sm text-gray-500 line-through">
                  {{
                    getOriginalPrice(discountPercentage)
                      | currency: 'USD' : 'symbol' : '1.2-2'
                  }}
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
            {{ translate()?.generic?.edit }}
          </button>
          <button
            class="btn-danger flex-1 text-sm transition-all duration-200 hover:scale-105"
            (click)="onDelete()"
          >
            <fa-icon [icon]="icons.faTrash" class="mr-1" />
            {{ translate()?.generic?.delete }}
          </button>
        </div>
      </div>
    </div>
  `
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
