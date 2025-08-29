import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { firstValueFrom } from 'rxjs';

import { Product } from '../../shared/models/product.model';
import { ProductService } from '../../core/services/product.service';

interface KPIData {
  totalProducts: number;
  totalStockValue: number;
  averagePrice: number;
  uniqueCategories: number;
}

interface ChartData {
  name: string;
  value: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgxChartsModule
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
      <div *ngIf="!isLoading()" class="space-y-8">
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Products -->
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">
                  {{ translate?.kpi?.totalProducts || 'Total de Produtos' }}
                </p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ kpiData().totalProducts }}
                </p>
              </div>
              <div class="p-3 bg-blue-100 rounded-full">
                <div class="text-2xl text-blue-600">📦</div>
              </div>
            </div>
          </div>

          <!-- Total Stock Value -->
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">
                  {{ translate?.kpi?.totalStockValue || 'Valor Total do Estoque' }}
                </p>
                <p class="text-2xl font-bold text-gray-900">
                  &#36;{{ formatNumber(kpiData().totalStockValue) }}
                </p>
              </div>
              <div class="p-3 bg-green-100 rounded-full">
                <div class="text-2xl text-green-600">💰</div>
              </div>
            </div>
          </div>

          <!-- Average Price -->
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">
                  {{ translate?.kpi?.averagePrice || 'Preço Médio dos Produtos' }}
                </p>
                <p class="text-2xl font-bold text-gray-900">
                  &#36;{{ formatNumber(kpiData().averagePrice) }}
                </p>
              </div>
              <div class="p-3 bg-yellow-100 rounded-full">
                <div class="text-2xl text-yellow-600">📊</div>
              </div>
            </div>
          </div>

          <!-- Unique Categories -->
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">
                  {{ translate?.kpi?.uniqueCategories || 'Número de Categorias Únicas' }}
                </p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ kpiData().uniqueCategories }}
                </p>
              </div>
              <div class="p-3 bg-purple-100 rounded-full">
                <div class="text-2xl text-purple-600">🏷️</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart Section -->
        <div class="card">
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">
              {{ translate?.chart?.title || 'Produtos por Categoria' }}
            </h2>
          </div>
          
          <div class="h-96">
            <ngx-charts-bar-vertical
              [results]="chartData()"
              [xAxis]="true"
              [yAxis]="true"
              [legend]="false"
              [showXAxisLabel]="true"
              [showYAxisLabel]="true"
              [xAxisLabel]="translate?.chart?.xAxisLabel || 'Categoria'"
              [yAxisLabel]="translate?.chart?.yAxisLabel || 'Quantidade'"
              [gradient]="false"
              [animations]="true"
              [showGridLines]="true">
            </ngx-charts-bar-vertical>
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
          Não foi possível carregar os dados do dashboard.
        </p>
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

  protected chartData = computed<ChartData[]>(() => {
    const products = this.products();
    
    if (products.length === 0) {
      return [];
    }

    // Group products by category and count them
    const categoryCount = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to chart format and sort by value descending
    return Object.entries(categoryCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  });

  // Chart color scheme
  protected colorScheme = {
    domain: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16', '#F97316']
  };

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

  private async loadDashboardData(): Promise<void> {
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
}