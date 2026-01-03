import { CommonModule } from '@angular/common'
import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { TranslateService } from '@ngx-translate/core'
import { PaginationTranslations } from '@shared/models/translate.model'
import { firstValueFrom } from 'rxjs'
import { PaginationState } from '../../models/product.model'

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html'
})
export class PaginationComponent implements OnInit {
  private readonly translateService = inject(TranslateService)

  constructor() {
    // Listen for language changes
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(async (): Promise<void> => {
        await this.buildTranslate()
      })
  }

  public readonly pagination = input.required<PaginationState>()
  public readonly pageChanged = output<number>()

  protected readonly translate = signal<PaginationTranslations | null>(null)

  protected readonly startItem = computed<number>((): number => {
    const pagination = this.pagination()
    return (pagination.currentPage - 1) * pagination.pageSize + 1
  })
  protected readonly endItem = computed<number>((): number => {
    const pagination = this.pagination()
    const end = pagination.currentPage * pagination.pageSize

    return Math.min(end, pagination.totalItems)
  })
  protected readonly getVisiblePages = computed<number[]>((): number[] => {
    const totalPages: number = this.pagination().totalPages
    const currentPage: number = this.pagination().currentPage
    const pages: number[] = []
    const ellipsis = -1

    const renderPages = (start: number, end: number): number[] => {
      for (let page = start; page <= end; page++) {
        pages.push(page)
      }

      return pages
    }

    if (totalPages <= 7) {
      return renderPages(1, totalPages)
    }

    if (currentPage <= 4) {
      renderPages(1, 5)
      pages.push(ellipsis, totalPages)

      return pages
    }

    if (currentPage >= totalPages - 3) {
      pages.push(1, ellipsis)
      renderPages(totalPages - 4, totalPages)

      return pages
    }

    pages.push(1, ellipsis)
    renderPages(currentPage - 1, currentPage + 1)
    pages.push(ellipsis, totalPages)

    return pages
  })

  async ngOnInit(): Promise<void> {
    await this.buildTranslate()
  }

  protected onPageChange(page: number): void {
    const isPageValid = page >= 1 && page <= this.pagination().totalPages
    const isCurrentPage = page === this.pagination().currentPage

    if (isPageValid && !isCurrentPage) {
      this.pageChanged.emit(page)
    }
  }

  protected pageButtonClass(page: number): string {
    const defaultClass = `relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300`

    const isEllipsis = page === -1
    if (isEllipsis) {
      return `${defaultClass} text-gray-700 cursor-default`
    }

    const baseClass = `${defaultClass} hover:bg-primary-500 hover:text-white focus:z-20 focus:outline-offset-0 transition-colors duration-200`
    if (page === this.pagination().currentPage) {
      return `${baseClass} z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600`
    }

    return `${baseClass} text-gray-900`
  }

  private async buildTranslate(): Promise<void> {
    const translate = await firstValueFrom(this.translateService.get('pagination'))

    this.translate.set(translate)
  }
}
