import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateService } from "@ngx-translate/core";
import { firstValueFrom } from "rxjs";

import { Product } from "../../../../shared/models/product.model";

@Component({
  selector: "app-product-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
      <!-- Product Image -->
      <div class="relative overflow-hidden rounded-lg mb-4">
        <div *ngIf="product.thumbnail; else noImage">
          <img 
            [src]="product.thumbnail" 
            [alt]="product.title"
            class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            (error)="onImageError($event)"
          />
        </div>
        <ng-template #noImage>
          <div class="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span class="text-gray-400 text-4xl">📦</span>
          </div>
        </ng-template>
        
        <!-- Stock Badge -->
        <div class="absolute top-2 right-2">
          <span [class]="getStockBadgeClass()">
            {{ getStockText() }}
          </span>
        </div>
        
        <!-- Discount Badge -->
        <div *ngIf="product.discountPercentage && product.discountPercentage > 0" 
             class="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          -{{ product.discountPercentage.toFixed(0) }}%
        </div>
      </div>

      <!-- Product Info -->
      <div class="space-y-3">
        <!-- Title and Category -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-medium text-primary-600 uppercase tracking-wide">
              {{ product.category }}
            </span>
            <div *ngIf="product.rating && product.rating > 0" class="flex items-center space-x-1">
              <span class="text-yellow-400">⭐</span>
              <span class="text-xs text-gray-600">{{ product.rating.toFixed(1) }}</span>
            </div>
          </div>
          <h3 class="font-semibold text-gray-900 line-clamp-2 text-lg">
            {{ product.title }}
          </h3>
          <p class="text-sm text-gray-600 line-clamp-2 mt-1">
            {{ product.description }}
          </p>
        </div>

        <!-- Brand -->
        <div *ngIf="product.brand" class="flex items-center space-x-2">
          <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            {{ product.brand }}
          </span>
        </div>

        <!-- Price -->
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <div class="flex items-baseline space-x-2">
              <span class="text-2xl font-bold text-gray-900">
                {{ getPriceDisplay(product.price) }}
              </span>
              <span *ngIf="product.discountPercentage && product.discountPercentage > 0" 
                    class="text-sm text-gray-500 line-through">
                {{ getOriginalPrice(product.price, product.discountPercentage) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex space-x-2 pt-3 border-t border-gray-100">
          <button 
            class="btn-secondary flex-1 text-sm transition-all duration-200 hover:scale-105"
            (click)="onEdit()"
          >
            <span class="mr-1">✏️</span>
            {{ translate?.generic?.edit || 'Editar' }}
          </button>
          <button 
            class="btn-danger flex-1 text-sm transition-all duration-200 hover:scale-105"
            (click)="onDelete()"
          >
            <span class="mr-1">🗑️</span>
            {{ translate?.generic?.delete || 'Excluir' }}
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
    `,
  ],
})
export class ProductCardComponent implements OnInit {
  @Input({ required: true }) product!: Product;
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  private translateService = inject(TranslateService);
  protected translate: any;

  async ngOnInit(): Promise<void> {
    await this.buildTranslate();
  }

  private async buildTranslate(): Promise<void> {
    const location = "pages.products";
    const translate = await firstValueFrom(this.translateService.get(location));
    const generic = await firstValueFrom(this.translateService.get("generic"));

    this.translate = { ...translate, generic };
  }

  protected onEdit(): void {
    this.edit.emit();
  }

  protected onDelete(): void {
    this.delete.emit();
  }

  protected onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.style.display = "none";
  }

  protected getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  protected getPriceDisplay(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  protected getOriginalPrice(price: number, discountPercentage: number): string {
    const originalPrice = price / (1 - discountPercentage / 100);
    return `$${originalPrice.toFixed(2)}`;
  }

  protected getStockBadgeClass(): string {
    const stock = this.product.stock;
    if (stock === 0) {
      return 'bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full';
    } else if (stock <= 10) {
      return 'bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full';
    } else {
      return 'bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full';
    }
  }

  protected getStockText(): string {
    const stock = this.product.stock;
    if (stock === 0) {
      return 'Esgotado';
    } else if (stock <= 10) {
      return `${stock} restantes`;
    } else {
      return `${stock} em estoque`;
    }
  }
}
