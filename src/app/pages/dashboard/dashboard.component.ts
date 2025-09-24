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

        <!-- Categories Chart Alternative -->
        <div class="card">
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">
              {{ translate?.chart?.title || 'Produtos por Categoria' }}
            </h2>
            <p class="text-gray-600">
              Distribuição dos produtos por categoria do catálogo
            </p>
          </div>
          
          <!-- Top Categories Stats -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div *ngFor="let category of getTopCategories(); let i = index" 
                 class="bg-gradient-to-r p-4 rounded-lg text-white"
                 [ngStyle]="{'background': getGradientColor(i)}">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm opacity-90">{{ category.name }}</p>
                  <p class="text-2xl font-bold">{{ category.count }}</p>
                  <p class="text-xs opacity-75">{{ category.percentage }}% do total</p>
                </div>
                <div class="text-2xl opacity-80">
                  {{ getCategoryIcon(category.name) }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Full Category List with Visual Bars -->
          <div class="space-y-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Todas as Categorias</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              <div *ngFor="let category of categoriesData(); let i = index" 
                   class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                     [ngStyle]="{'background-color': getColorForIndex(i)}">
                  {{ category.count }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ category.name }}
                    </p>
                    <span class="text-xs text-gray-500">{{ category.percentage }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-500"
                         [ngStyle]="{'width.%': category.percentage, 'background-color': getColorForIndex(i)}">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Summary Stats -->
          <div class="mt-6 pt-4 border-t border-gray-200">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div class="text-2xl font-bold text-blue-600">{{ categoriesData().length }}</div>
                <div class="text-xs text-gray-600">Total de Categorias</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-green-600">{{ getMostPopularCategory()?.name || '-' }}</div>
                <div class="text-xs text-gray-600">Mais Popular</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-purple-600">{{ getAverageProductsPerCategory() }}</div>
                <div class="text-xs text-gray-600">Média por Categoria</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-orange-600">{{ getMostPopularCategory()?.count || 0 }}</div>
                <div class="text-xs text-gray-600">Produtos na Maior</div>
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
}