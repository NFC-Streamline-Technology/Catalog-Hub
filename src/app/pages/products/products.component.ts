import { CommonModule } from '@angular/common'
import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'
import { debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs/operators'

import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { faBox, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons'
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component'
import { PaginationComponent } from '@shared/components/pagination/pagination.component'
import { PaginationState, Product, ProductsResponse } from '@shared/models/product.model'
import type { ProductsTranslations } from '@shared/models/translate.model'
import { ProductCardComponent } from './components/product-card/product-card.component'
import { ProductFormComponent } from './components/product-form/product-form.component'
import { ProductService } from './services/product.service'

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProductFormComponent,
    ProductCardComponent,
    ConfirmDialogComponent,
    PaginationComponent,
    FontAwesomeModule
  ],
  templateUrl: 'products.component.html'
})
export class ProductsComponent implements OnInit {
  private readonly productService = inject(ProductService)
  private readonly translateService = inject(TranslateService)

  constructor() {
    this.setupSearch()
    this.setupPageSizeChange()

    // Listen for language changes
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(async (): Promise<void> => {
        await this.buildTranslate()
      })
  }

  protected readonly categories = signal<string[]>([])
  protected readonly products = signal<Product[]>([])
  protected readonly showForm = signal<boolean>(false)
  protected readonly showPaginationComponent = signal<boolean>(true)
  protected readonly showDeleteConfirm = signal<boolean>(false)
  protected readonly selectedProduct = signal<Product | null>(null)
  protected readonly translate = signal<ProductsTranslations | null>(null)
  protected readonly paginationState = signal<PaginationState>({
    currentPage: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0
  })

  protected readonly startItem = computed<number>((): number => {
    const pagination = this.paginationState()
    return (pagination.currentPage - 1) * pagination.pageSize + 1
  })

  protected readonly endItem = computed<number>((): number => {
    const pagination = this.paginationState()
    const end = pagination.currentPage * pagination.pageSize

    return Math.min(end, pagination.totalItems)
  })

  protected readonly icons = { faPlus, faSearch, faBox }

  protected readonly searchControl = new FormControl<string>('')
  protected readonly categoryControl = new FormControl<string>('')
  protected readonly pageSizeControl = new FormControl<number>(
    this.paginationState().pageSize
  )

  async ngOnInit(): Promise<void> {
    await this.buildTranslate()
    await this.loadProducts()
  }

  protected openCreateForm(): void {
    this.selectedProduct.set(null)
    this.showForm.set(true)
  }

  protected openEditForm(product: Product): void {
    this.selectedProduct.set(product)
    this.showForm.set(true)
  }

  protected openDeleteConfirm(product: Product): void {
    this.selectedProduct.set(product)
    this.showDeleteConfirm.set(true)
  }

  protected async onProductSaved(): Promise<void> {
    this.showForm.set(false)
    this.selectedProduct.set(null)

    // Refresh products list
    await this.loadProducts()

    // Show success message (you could implement a toast service here)
    console.log('Product saved successfully')
  }

  protected onFormCancelled(): void {
    this.showForm.set(false)
    this.selectedProduct.set(null)
  }

  protected async onDeleteConfirmed(): Promise<void> {
    const product: Product | null = this.selectedProduct()
    if (product) {
      try {
        await firstValueFrom(this.productService.deleteProduct(product.id))
        console.log('Product deleted successfully')

        await this.loadProducts()
      } catch (error: unknown) {
        console.error('Error deleting product:', error)
      }
    }

    this.showDeleteConfirm.set(false)
    this.selectedProduct.set(null)
  }

  protected onDeleteCancelled(): void {
    this.showDeleteConfirm.set(false)
    this.selectedProduct.set(null)
  }

  protected async onPageChanged(page: number): Promise<void> {
    this.paginationState.update((state): PaginationState => {
      return { ...state, currentPage: page }
    })

    await this.loadProducts()
  }

  private async loadProducts(searching: boolean = false): Promise<void> {
    try {
      const pagination: PaginationState = this.paginationState()
      const skip: number = (pagination.currentPage - 1) * pagination.pageSize
      const getProducts = this.productService.getProducts(
        this.searchControl.value?.trim() || '',
        pagination.pageSize,
        searching ? 0 : skip
      )

      const response: ProductsResponse = await firstValueFrom(getProducts)
      this.products.set(response.products)
      this.paginationState.update((state): PaginationState => {
        return {
          ...state,
          currentPage: searching ? 1 : state.currentPage,
          totalItems: response.total,
          totalPages: Math.ceil(response.total / state.pageSize)
        }
      })
    } catch (error: unknown) {
      console.error('Error searching products:', error)
    }
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((): Promise<void> => {
          this.resetPagination()

          return this.loadProducts(true)
        })
      )
      .pipe(takeUntilDestroyed())
      .subscribe()
  }

  private setupPageSizeChange(): void {
    this.pageSizeControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((pageSize: number | null): void => {
        const statePageSize = this.paginationState().pageSize

        this.paginationState.update((state): PaginationState => {
          return {
            ...state,
            pageSize: pageSize ?? statePageSize,
            currentPage: 1
          }
        })

        this.loadProducts()
      })
  }

  private resetPagination(): void {
    this.paginationState.update((state: PaginationState): PaginationState => {
      return {
        ...state,
        currentPage: 1
      }
    })
  }

  private async buildTranslate(): Promise<void> {
    const location = 'pages.products'
    const translate = await firstValueFrom(this.translateService.get(location))
    const generic = await firstValueFrom(this.translateService.get('generic'))

    this.translate.set({ ...translate, generic })
  }
}
