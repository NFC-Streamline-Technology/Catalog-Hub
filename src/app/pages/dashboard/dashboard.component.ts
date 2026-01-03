import { CommonModule } from '@angular/common'
import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { LoadingService } from '@core/services/loading.service'
import { TranslateService } from '@ngx-translate/core'
import { Product } from '@shared/models/product.model'
import { DashboardTranslations } from '@shared/models/translate.model'
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
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService)
  private readonly translateService = inject(TranslateService)
  private readonly loadingService = inject(LoadingService)

  constructor() {
    // Listen for language changes
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(async (): Promise<void> => {
        await this.buildTranslate()
      })
  }

  protected readonly products = signal<Product[]>([])
  protected readonly hasError = signal<boolean>(false)
  protected readonly translate = signal<DashboardTranslations | null>(null)
  protected readonly isLoading = this.loadingService.isLoading

  protected readonly kpiData = computed<KPIData>((): KPIData => {
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
  protected readonly categoriesData = computed<CategoryData[]>((): CategoryData[] => {
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

  private async buildTranslate(): Promise<void> {
    const translate = await firstValueFrom(this.translateService.get('pages.dashboard'))
    const generic = await firstValueFrom(this.translateService.get('generic'))

    this.translate.set({ ...translate, generic })
  }
}
