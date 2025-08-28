import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { Product } from '../../../../shared/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card hover:shadow-md transition-shadow duration-200">
      <!-- Product Image -->
      <div *ngIf="product.thumbnail; else noImage">
        <img 
          [src]="product.thumbnail" 
          [alt]="product.title"
          class="w-full h-48 object-cover rounded-lg mb-4"
          (error)="onImageError($event)"
        />
      </div>
      <ng-template #noImage>
        <div class="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
          <span class="text-gray-400 text-4xl">📦</span>
        </div>
      </ng-template>

      <!-- Product Info -->
      <div class="space-y-3">
        <div>
          <h3 class="font-semibold text-gray-900 line-clamp-2">
            {{ product.title }}
          </h3>
          <p class="text-sm text-gray-600 line-clamp-2 mt-1">
            {{ product.description }}
          </p>
        </div>

        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-500">{{ translate?.fields?.category || 'Categoria' }}:</span>
          <span class="font-medium text-gray-900 capitalize">{{ product.category }}</span>
        </div>

        <div *ngIf="product.brand" class="flex items-center justify-between text-sm">
          <span class="text-gray-500">{{ translate?.fields?.brand || 'Marca' }}:</span>
          <span class="font-medium text-gray-900">{{ product.brand }}</span>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-2xl font-bold text-primary-600">
              {{ getPriceDisplay(product.price) }}
            </span>
            <span *ngIf="product.discountPercentage && product.discountPercentage > 0" 
                  class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
              -{{ product.discountPercentage.toFixed(0) }}%
            </span>
          </div>
          
          <div class="text-sm text-gray-500">
            {{ translate?.fields?.stock || 'Estoque' }}: {{ product.stock }}
          </div>
        </div>

        <div *ngIf="product.rating && product.rating > 0" class="flex items-center space-x-1">
          <div class="flex items-center">
            <span *ngFor="let star of getStarArray(product.rating)" class="text-yellow-400">⭐</span>
          </div>
          <span class="text-sm text-gray-600">({{ product.rating.toFixed(1) }})</span>
        </div>

        <!-- Actions -->
        <div class="flex space-x-2 pt-3 border-t border-gray-100">
          <button 
            class="btn-secondary flex-1 text-sm"
            (click)="onEdit()"
          >
            {{ translate?.generic?.edit || 'Editar' }}
          </button>
          <button 
            class="btn-danger flex-1 text-sm"
            (click)="onDelete()"
          >
            {{ translate?.generic?.delete || 'Excluir' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
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
    const location = 'pages.products';
    const translate = await firstValueFrom(this.translateService.get(location));
    const generic = await firstValueFrom(this.translateService.get('generic'));

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
    target.style.display = 'none';
  }

  protected getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  protected getPriceDisplay(price: number): string {
    return `$${price.toFixed(2)}`;
  }
}