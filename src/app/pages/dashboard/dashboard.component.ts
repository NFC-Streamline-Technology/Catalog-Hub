import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { Product } from '../../shared/models/product.model';
import { ProductService } from '../../core/services/product.service';

interface KPIData {
  totalProducts: number;
  totalStockValue: number;
  averagePrice: number;
  uniqueCategories: number;
}

interface CategoryData {
  name: string;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ translate?.title || 'Dashboard' }}
        </h1>
        <p class="text-gray-600 mt-1">
          {{ translate?.subtitle || 'Visão geral dos seus produtos e estatísticas' }}
        </p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center items-center py-12">
        <div class="spinner w-8 h-8"></div>
        <span class="ml-2 text-gray-600">{{ genericTranslate?.loading || 'Carregando...' }}</span>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!isLoading() && !hasError()" class="space-y-8">
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Products -->
          <div class="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-blue-800">
                  {{ translate?.kpi?.totalProducts || 'Total de Produtos' }}
                </p>
                <p class="text-3xl font-bold text-blue-900">
                  {{ kpiData().totalProducts }}
                </p>
              </div>
              <div class="p-3 bg-blue-200 rounded-full">
                <div class="text-2xl text-blue-800">📦</div>
              </div>
            </div>
          </div>

          <!-- Total Stock Value -->
          <div class="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-green-800">
                  {{ translate?.kpi?.totalStockValue || 'Valor Total do Estoque' }}
                </p>
                <p class="text-3xl font-bold text-green-900">
                  &#36;{{ formatNumber(kpiData().totalStockValue) }}
                </p>
              </div>
              <div class="p-3 bg-green-200 rounded-full">
                <div class="text-2xl text-green-800">💰</div>
              </div>
            </div>
          </div>

          <!-- Average Price -->
          <div class="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-yellow-800">
                  {{ translate?.kpi?.averagePrice || 'Preço Médio dos Produtos' }}
                </p>
                <p class="text-3xl font-bold text-yellow-900">
                  &#36;{{ formatNumber(kpiData().averagePrice) }}
                </p>
              </div>
              <div class="p-3 bg-yellow-200 rounded-full">
                <div class="text-2xl text-yellow-800">📊</div>
              </div>
            </div>
          </div>

          <!-- Unique Categories -->
          <div class="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-purple-800">
                  {{ translate?.kpi?.uniqueCategories || 'Número de Categorias Únicas' }}
                </p>
                <p class="text-3xl font-bold text-purple-900">
                  {{ kpiData().uniqueCategories }}
                </p>
              </div>
              <div class="p-3 bg-purple-200 rounded-full">
                <div class="text-2xl text-purple-800">🏷️</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Categories Visualization -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Categories Donut Chart -->
          <div class="card">
            <div class="mb-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-2">
                {{ translate?.chart?.title || 'Produtos por Categoria' }}
              </h2>
              <p class="text-gray-600 text-sm">
                Distribuição visual das categorias mais populares
              </p>
            </div>
            
            <!-- Donut Chart with CSS -->
            <div class="flex items-center justify-center mb-6">
              <div class="relative w-64 h-64">
                <!-- Background Circle -->
                <svg class="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                  <!-- Background -->
                  <circle cx="50" cy="50" r="40" stroke="#f3f4f6" stroke-width="8" fill="none"/>
                  
                  <!-- Category Segments -->
                  <circle *ngFor="let category of getTopCategories(); let i = index"
                          cx="50" cy="50" r="40" 
                          [attr.stroke]="getColorForIndex(i)"
                          stroke-width="8" 
                          fill="none"
                          [attr.stroke-dasharray]="getCircleSegment(category.percentage) + ' 251.2'"
                          [attr.stroke-dashoffset]="getCircleOffset(i)"
                          class="transition-all duration-1000 ease-out"
                          style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
                </svg>
                
                <!-- Center Text -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-gray-900">{{ kpiData().totalProducts }}</div>
                    <div class="text-xs text-gray-600">Total</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Legend -->
            <div class="space-y-2">
              <div *ngFor="let category of getTopCategories(); let i = index" 
                   class="flex items-center space-x-3">
                <div class="w-4 h-4 rounded-full"
                     [ngStyle]="{'background-color': getColorForIndex(i)}"></div>
                <span class="text-sm font-medium text-gray-700">{{ category.name }}</span>
                <span class="text-sm text-gray-500">{{ category.count }} produtos</span>
                <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-auto">
                  {{ category.percentage }}%
                </span>
              </div>
              <div *ngIf="categoriesData().length > 3" class="flex items-center space-x-3 pt-2 border-t">
                <div class="w-4 h-4 rounded-full bg-gray-300"></div>
                <span class="text-sm text-gray-600">Outras categorias</span>
                <span class="text-sm text-gray-500">{{ getOtherCategoriesCount() }} produtos</span>
                <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-auto">
                  {{ getOtherCategoriesPercentage() }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Top Categories Cards -->
          <div class="space-y-4">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Top Categorias</h3>
              <p class="text-gray-600 text-sm">As 3 categorias com mais produtos</p>
            </div>
            
            <div *ngFor="let category of getTopCategories(); let i = index" 
                 class="bg-gradient-to-r p-4 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                 [ngStyle]="{'background': getGradientColor(i)}">
              <div class="flex items-center justify-between">
                <div>
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="text-2xl">{{ getCategoryIcon(category.name) }}</span>
                    <span class="text-lg font-semibold">{{ category.name }}</span>
                  </div>
                  <div class="text-3xl font-bold mb-1">{{ category.count }}</div>
                  <div class="text-sm opacity-90">{{ category.percentage }}% do catálogo</div>
                </div>
                <div class="text-right">
                  <div class="text-xs opacity-75 mb-1">#{{ i + 1 }} Posição</div>
                  <div class="w-16 h-2 bg-white/30 rounded-full">
                    <div class="h-2 bg-white rounded-full transition-all duration-1000"
                         [style.width.%]="category.percentage">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="bg-gray-50 p-4 rounded-xl">
              <h4 class="font-medium text-gray-900 mb-3">Estatísticas Rápidas</h4>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="text-center p-2 bg-white rounded-lg">
                  <div class="font-bold text-blue-600">{{ categoriesData().length }}</div>
                  <div class="text-gray-600 text-xs">Categorias</div>
                </div>
                <div class="text-center p-2 bg-white rounded-lg">
                  <div class="font-bold text-green-600">{{ getAverageProductsPerCategory() }}</div>
                  <div class="text-gray-600 text-xs">Média/Cat.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- All Categories Grid -->
        <div class="card">
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Todas as Categorias</h3>
            <p class="text-gray-600 text-sm">Visualização completa de todas as categorias do catálogo</p>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
            <div *ngFor="let category of categoriesData(); let i = index" 
                 class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:shadow-md hover:border-primary-300 transition-all duration-200 group">
              <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
                   [ngStyle]="{'background-color': getColorForIndex(i)}">
                {{ category.count }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <p class="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600">
                    {{ category.name }}
                  </p>
                  <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {{ category.percentage }}%
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="h-2 rounded-full transition-all duration-500 group-hover:shadow-lg"
                       [ngStyle]="{'width.%': category.percentage, 'background-color': getColorForIndex(i)}">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="hasError()" class="text-center py-12">
        <div class="text-red-400 text-6xl mb-4">⚠️</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ genericTranslate?.error || 'Erro' }}
        </h3>
        <p class="text-gray-500">
          Não foi possível carregar os dados do dashboard. Verifique sua conexão com a internet.
        </p>
        <button 
          (click)="loadDashboardData()"
          class="mt-4 btn-primary"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private translateService = inject(TranslateService);

  // Signals
  protected products = signal<Product[]>([]);
  protected isLoading = signal(true);
  protected hasError = signal(false);
  protected translate: any;
  protected genericTranslate: any;

  // Computed values
  protected kpiData = computed<KPIData>(() => {
    const products = this.products();
    
    if (products.length === 0) {
      return {
        totalProducts: 0,
        totalStockValue: 0,
        averagePrice: 0,
        uniqueCategories: 0
      };
    }

    const totalProducts = products.length;
    const totalStockValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const averagePrice = products.reduce((sum, product) => sum + product.price, 0) / totalProducts;
    const uniqueCategories = new Set(products.map(product => product.category)).size;

    return {
      totalProducts,
      totalStockValue,
      averagePrice,
      uniqueCategories
    };
  });

  protected categoriesData = computed<CategoryData[]>(() => {
    const products = this.products();
    
    if (products.length === 0) {
      return [];
    }

    // Group products by category and count them
    const categoryCount = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalProducts = products.length;

    // Convert to chart format and sort by value descending
    return Object.entries(categoryCount)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        percentage: Math.round((count / totalProducts) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  });

  async ngOnInit(): Promise<void> {
    await this.buildTranslate();
    await this.loadDashboardData();

    // Listen for language changes
    this.translateService.onLangChange.subscribe(() => {
      this.buildTranslate();
    });
  }

  private async buildTranslate(): Promise<void> {
    try {
      const dashboardTranslate = await firstValueFrom(this.translateService.get('pages.dashboard'));
      const genericTranslate = await firstValueFrom(this.translateService.get('generic'));

      this.translate = dashboardTranslate;
      this.genericTranslate = genericTranslate;
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  }

  protected async loadDashboardData(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.hasError.set(false);
      
      const products = await firstValueFrom(this.productService.getAllProducts());
      this.products.set(products);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  protected trackByCategory(index: number, category: CategoryData): string {
    return category.name;
  }

  protected getTopCategories(): CategoryData[] {
    return this.categoriesData().slice(0, 3);
  }

  protected getGradientColor(index: number): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #91a7ff 100%)',
    ];
    return gradients[index % gradients.length];
  }

  protected getColorForIndex(index: number): string {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', 
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
      '#14B8A6', '#F472B6', '#8B5CF6', '#F59E0B', '#10B981'
    ];
    return colors[index % colors.length];
  }

  protected getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'smartphones': '📱',
      'laptops': '💻',
      'fragrances': '🌸',
      'skincare': '🧴',
      'groceries': '🛒',
      'home-decoration': '🏠',
      'furniture': '🪑',
      'tops': '👕',
      'womens-dresses': '👗',
      'womens-shoes': '👠',
      'mens-shirts': '👔',
      'mens-shoes': '👞',
      'mens-watches': '⌚',
      'womens-watches': '⌚',
      'womens-bags': '👜',
      'womens-jewellery': '💎',
      'sunglasses': '🕶️',
      'automotive': '🚗',
      'motorcycle': '🏍️',
      'lighting': '💡',
      'kitchen-accessories': '🍳',
      'sports-accessories': '⚽',
      'mobile-accessories': '📞',
      'beauty': '💄',
      'vehicle': '🚙'
    };
    return iconMap[categoryName.toLowerCase()] || '📦';
  }

  protected getMostPopularCategory(): CategoryData | undefined {
    const categories = this.categoriesData();
    return categories.length > 0 ? categories[0] : undefined;
  }

  protected getAverageProductsPerCategory(): number {
    const categories = this.categoriesData();
    if (categories.length === 0) return 0;
    const total = categories.reduce((sum, cat) => sum + cat.count, 0);
    return Math.round(total / categories.length);
  }
}