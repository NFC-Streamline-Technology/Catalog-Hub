import { CommonModule } from '@angular/common'
import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { LoadingService } from '@core/services/loading.service'
import { TranslateService } from '@ngx-translate/core'
import { Product } from '@shared/models/product.model'
import { firstValueFrom } from 'rxjs'
import { DashboardService } from './services/dashboard.service'

interface KPIData {
  totalProducts: number
  totalStockValue: number
  averagePrice: number
  uniqueCategories: number
}

interface CategoryData {
  name: string
  count: number
  percentage: number
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ translate?.title || 'Dashboard' }}
        </h1>
        <p class="text-gray-600 mt-1">
          {{ translate?.subtitle }}
        </p>
      </div>

      <!-- Dashboard Content -->
      @if (!isLoading() && !hasError()) {
        <div class="space-y-8">
          <!-- KPI Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Total Products -->
            <div class="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-blue-800">
                    {{ translate?.kpi?.totalProducts }}
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
            <div
              class="card bg-gradient-to-br from-green-50 to-green-100 border-green-200"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-green-800">
                    {{ translate?.kpi?.totalStockValue }}
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
            <div
              class="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-yellow-800">
                    {{ translate?.kpi?.averagePrice }}
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
            <div
              class="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-purple-800">
                    {{ translate?.kpi?.uniqueCategories }}
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
                  {{ translate?.chart?.title }}
                </h2>
                <p class="text-gray-600 text-sm">
                  {{ translate?.chart?.subtitle }}
                </p>
              </div>

              <!-- Donut Chart with CSS -->
              <div class="flex items-center justify-center mb-6">
                <div class="relative w-64 h-64">
                  <!-- Background Circle -->
                  <svg class="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                    <!-- Background -->
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#f3f4f6"
                      stroke-width="8"
                      fill="none"
                    />

                    <!-- Category Segments -->
                    @for (category of getTopCategories(); track $index) {
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        [attr.stroke]="getColorForIndex($index)"
                        stroke-width="8"
                        fill="none"
                        [attr.stroke-dasharray]="
                          getCircleSegment(category.percentage) + ' 251.2'
                        "
                        [attr.stroke-dashoffset]="getCircleOffset($index)"
                        class="transition-all duration-1000 ease-out"
                        style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                      />
                    }
                  </svg>

                  <!-- Center Text -->
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-center">
                      <div class="text-2xl font-bold text-gray-900">
                        {{ kpiData().totalProducts }}
                      </div>
                      <div class="text-xs text-gray-600">
                        {{ translate?.chart?.total }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Legend -->
              <div class="space-y-2">
                @for (category of getTopCategories(); track $index) {
                  <div class="flex items-center space-x-3">
                    <div
                      class="w-4 h-4 rounded-full"
                      [ngStyle]="{ 'background-color': getColorForIndex($index) }"
                    ></div>
                    <span class="text-sm font-medium text-gray-700">{{
                      category.name
                    }}</span>
                    <span class="text-sm text-gray-500">
                      {{ category.count }} {{ translate?.chart?.products }}
                    </span>
                    <span
                      class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-auto"
                    >
                      {{ category.percentage }}%
                    </span>
                  </div>
                }

                @if (categoriesData().length > 3) {
                  <div class="flex items-center space-x-3 pt-2 border-t">
                    <div class="w-4 h-4 rounded-full bg-gray-300"></div>
                    <span class="text-sm text-gray-600">
                      {{ translate?.chart?.otherCategories }}
                    </span>
                    <span class="text-sm text-gray-500">
                      {{ getOtherCategoriesCount() }} {{ translate?.chart?.products }}
                    </span>
                    <span
                      class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-auto"
                    >
                      {{ getOtherCategoriesPercentage() }}%
                    </span>
                  </div>
                }
              </div>
            </div>

            <!-- Top Categories Cards -->
            <div class="space-y-4">
              <div class="mb-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  {{ translate?.topCategories?.title }}
                </h3>
                <p class="text-gray-600 text-sm">
                  {{ translate?.topCategories?.subtitle }}
                </p>
              </div>

              @for (category of getTopCategories(); track $index) {
                <div
                  class="bg-gradient-to-r p-4 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                  [ngStyle]="{ background: getGradientColor($index) }"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="flex items-center space-x-2 mb-2">
                        <span class="text-2xl">{{ getCategoryIcon(category.name) }}</span>
                        <span class="text-lg font-semibold">{{ category.name }}</span>
                      </div>
                      <div class="text-3xl font-bold mb-1">
                        {{ category.count }}
                      </div>
                      <div class="text-sm opacity-90">
                        {{ category.percentage }}%
                        {{ translate?.topCategories?.ofCatalog }}
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-xs opacity-75 mb-1">
                        #{{ $index + 1 }} {{ translate?.topCategories?.position }}
                      </div>
                      <div class="w-16 h-2 bg-white/30 rounded-full">
                        <div
                          class="h-2 bg-white rounded-full transition-all duration-1000"
                          [style.width.%]="category.percentage"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              }
              <!-- Quick Stats -->
              <div class="bg-gray-50 p-4 rounded-xl">
                <h4 class="font-medium text-gray-900 mb-3">
                  {{ translate?.quickStats?.title }}
                </h4>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div class="text-center p-2 bg-white rounded-lg">
                    <div class="font-bold text-blue-600">
                      {{ categoriesData().length }}
                    </div>
                    <div class="text-gray-600 text-xs">
                      {{ translate?.quickStats?.categories }}
                    </div>
                  </div>
                  <div class="text-center p-2 bg-white rounded-lg">
                    <div class="font-bold text-green-600">
                      {{ getAverageProductsPerCategory() }}
                    </div>
                    <div class="text-gray-600 text-xs">
                      {{ translate?.quickStats?.avgPerCategory }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- All Categories Grid -->
          <div class="card">
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                {{ translate?.allCategories?.title }}
              </h3>
              <p class="text-gray-600 text-sm">
                {{ translate?.allCategories?.subtitle }}
              </p>
            </div>

            <div
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-96 overflow-y-auto"
            >
              @for (category of categoriesData(); track $index) {
                <div
                  class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:shadow-md hover:border-primary-300 transition-all duration-200 group"
                >
                  <div
                    class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
                    [ngStyle]="{ 'background-color': getColorForIndex($index) }"
                  >
                    {{ category.count }}
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                      <p
                        class="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600"
                      >
                        {{ category.name }}
                      </p>
                      <span
                        class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {{ category.percentage }}%
                      </span>
                    </div>

                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="h-2 rounded-full transition-all duration-500 group-hover:shadow-lg"
                        [ngStyle]="{
                          'width.%': category.percentage,
                          'background-color': getColorForIndex($index)
                        }"
                      ></div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Error State -->
      @if (hasError()) {
        <div class="text-center py-12">
          <div class="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{ genericTranslate?.error }}
          </h3>
          <p class="text-gray-500">
            {{ translate?.error?.message }}
          </p>
          <button (click)="loadDashboardData()" class="mt-4 btn-primary">
            {{ genericTranslate?.retry }}
          </button>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  constructor() {
    // Listen for language changes
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(async (): Promise<void> => {
        await this.buildTranslate()
      })
  }

  private readonly dashboardService = inject(DashboardService)
  private readonly translateService = inject(TranslateService)
  private readonly loadingService = inject(LoadingService)

  // Signals
  protected readonly products = signal<Product[]>([])
  protected readonly hasError = signal<boolean>(false)
  protected readonly isLoading = this.loadingService.isLoading
  protected translate: any
  protected genericTranslate: any

  // Computed values
  protected kpiData = computed<KPIData>((): KPIData => {
    const products: Product[] = this.products()

    if (products.length === 0) {
      return {
        totalProducts: 0,
        totalStockValue: 0,
        averagePrice: 0,
        uniqueCategories: 0
      }
    }

    const totalProducts: number = products.length
    const totalStockValue: number = products.reduce(
      (sum: number, product: Product): number => sum + product.price * product.stock,
      0
    )
    const averagePrice: number =
      products.reduce((sum: number, product: Product): number => sum + product.price, 0) /
      totalProducts
    const uniqueCategories: number = new Set(
      products.map((product: Product): string => product.category)
    ).size

    return {
      totalProducts,
      totalStockValue,
      averagePrice,
      uniqueCategories
    }
  })

  protected categoriesData = computed<CategoryData[]>((): CategoryData[] => {
    const products: Product[] = this.products()

    if (products.length === 0) {
      return []
    }

    // Group products by category and count them
    const categoryCount: Record<string, number> = products.reduce(
      (acc: Record<string, number>, product: Product): Record<string, number> => {
        acc[product.category] = (acc[product.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const totalProducts: number = products.length

    // Convert to chart format and sort by value descending
    return Object.entries(categoryCount)
      .map(
        ([name, count]: [string, number]): CategoryData => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          count,
          percentage: Math.round((count / totalProducts) * 100)
        })
      )
      .sort((a: CategoryData, b: CategoryData): number => b.count - a.count)
  })

  async ngOnInit(): Promise<void> {
    await this.buildTranslate()
    await this.loadDashboardData()
  }

  private async buildTranslate(): Promise<void> {
    try {
      const dashboardTranslate = await firstValueFrom(
        this.translateService.get('pages.dashboard')
      )
      const genericTranslate = await firstValueFrom(this.translateService.get('generic'))

      this.translate = dashboardTranslate
      this.genericTranslate = genericTranslate
    } catch (error: unknown) {
      console.error('Error loading translations:', error)
    }
  }

  protected async loadDashboardData(): Promise<void> {
    try {
      this.hasError.set(false)

      const products: Product[] = await firstValueFrom(
        this.dashboardService.getAllProducts()
      )
      this.products.set(products)
    } catch (error: unknown) {
      console.error('Error loading dashboard data:', error)
      this.hasError.set(true)
    }
  }

  protected formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  protected trackByCategory(index: number, category: CategoryData): string {
    return category.name
  }

  protected getTopCategories(): CategoryData[] {
    return this.categoriesData().slice(0, 3)
  }

  protected getGradientColor(index: number): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #91a7ff 100%)'
    ]
    return gradients[index % gradients.length]
  }

  protected getColorForIndex(index: number): string {
    const colors = [
      '#3B82F6',
      '#10B981',
      '#F59E0B',
      '#8B5CF6',
      '#EF4444',
      '#06B6D4',
      '#84CC16',
      '#F97316',
      '#EC4899',
      '#6366F1',
      '#14B8A6',
      '#F472B6',
      '#8B5CF6',
      '#F59E0B',
      '#10B981'
    ]

    return colors[index % colors.length]
  }

  protected getCategoryIcon(categoryName: string): string {
    const iconMap: Record<string, string> = {
      smartphones: '📱',
      laptops: '💻',
      fragrances: '🌸',
      skincare: '🧴',
      groceries: '🛒',
      'home-decoration': '🏠',
      furniture: '🪑',
      tops: '👕',
      'womens-dresses': '👗',
      'womens-shoes': '👠',
      'mens-shirts': '👔',
      'mens-shoes': '👞',
      'mens-watches': '⌚',
      'womens-watches': '⌚',
      'womens-bags': '👜',
      'womens-jewellery': '💎',
      sunglasses: '🕶️',
      automotive: '🚗',
      motorcycle: '🏍️',
      lighting: '💡',
      'kitchen-accessories': '🍳',
      'sports-accessories': '⚽',
      'mobile-accessories': '📞',
      beauty: '💄',
      vehicle: '🚙'
    }
    return iconMap[categoryName.toLowerCase()] || '📦'
  }

  protected getMostPopularCategory(): CategoryData | undefined {
    const categories = this.categoriesData()
    return categories.length > 0 ? categories[0] : undefined
  }

  protected getAverageProductsPerCategory(): number {
    const categories: CategoryData[] = this.categoriesData()
    if (categories.length === 0) return 0
    const total: number = categories.reduce(
      (sum: number, cat: CategoryData): number => sum + cat.count,
      0
    )
    return Math.round(total / categories.length)
  }

  protected getCircleSegment(percentage: number): number {
    const circumference = 2 * Math.PI * 40 // 251.2
    return (percentage / 100) * circumference
  }

  protected getCircleOffset(index: number): number {
    const categories = this.getTopCategories()
    let offset = 0
    for (let i = 0; i < index; i++) {
      offset += this.getCircleSegment(categories[i].percentage)
    }
    return -offset
  }

  protected getOtherCategoriesCount(): number {
    const topCategories: CategoryData[] = this.getTopCategories()
    const allCategories: CategoryData[] = this.categoriesData()
    const topCategoriesCount: number = topCategories.reduce(
      (sum: number, cat: CategoryData): number => sum + cat.count,
      0
    )
    const totalCount: number = allCategories.reduce(
      (sum: number, cat: CategoryData): number => sum + cat.count,
      0
    )
    return totalCount - topCategoriesCount
  }

  protected getOtherCategoriesPercentage(): number {
    const topCategories: CategoryData[] = this.getTopCategories()
    const topPercentage: number = topCategories.reduce(
      (sum: number, cat: CategoryData): number => sum + cat.percentage,
      0
    )
    return Math.max(0, 100 - topPercentage)
  }
}
