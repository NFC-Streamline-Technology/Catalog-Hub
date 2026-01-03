import { CommonModule } from '@angular/common'
import { Component, OnInit, inject, input, output, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { TranslateService } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'
import { PaginationState } from '../../models/product.model'

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (pagination().totalPages > 1) {
      <div class="flex items-center justify-between px-4 py-3 sm:px-6">
        <div class="flex flex-1 justify-between sm:hidden">
          <button
            (click)="onPageChange(pagination().currentPage - 1)"
            [disabled]="pagination().currentPage === 1"
            class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ translate()?.previous }}
          </button>
          <button
            (click)="onPageChange(pagination().currentPage + 1)"
            [disabled]="pagination().currentPage === pagination().totalPages"
            class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ translate()?.next }}
          </button>
        </div>

        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              {{ translate()?.showing }}
              <span class="font-medium">{{ startItem }}</span>
              {{ translate()?.to }}
              <span class="font-medium">{{ endItem }}</span>
              {{ translate()?.of }}
              <span class="font-medium">{{ pagination().totalItems }}</span>
              {{ translate()?.results }}
            </p>
          </div>
          <div>
            <nav
              class="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <!-- Previous button -->
              <button
                (click)="onPageChange(pagination().currentPage - 1)"
                [disabled]="pagination().currentPage === 1"
                class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">{{ translate()?.previous }}</span>
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>

              <!-- Page numbers -->
              @for (page of getVisiblePages(); track $index) {
                <button
                  (click)="onPageChange(page)"
                  [class]="getPageButtonClass(page)"
                  [disabled]="page === -1"
                >
                  {{ page === -1 ? '...' : page }}
                </button>
              }

              <!-- Next button -->
              <button
                (click)="onPageChange(pagination().currentPage + 1)"
                [disabled]="pagination().currentPage === pagination().totalPages"
                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">{{ translate()?.next }}</span>
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    }
  `
})
export class PaginationComponent implements OnInit {
  constructor() {
    // Listen for language changes
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(async (): Promise<void> => {
        await this.buildTranslate()
      })
  }

  private readonly translateService = inject(TranslateService)

  public readonly pagination = input.required<PaginationState>()
  public readonly pageChanged = output<number>()

  protected readonly translate = signal<any>(null)

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

  protected getVisiblePages(): number[] {
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
  }

  protected getPageButtonClass(page: number): string {
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
    const generic = await firstValueFrom(this.translateService.get('generic'))
    const pagination = await firstValueFrom(this.translateService.get('pagination'))

    this.translate.set({ ...generic, ...pagination })
  }

  protected get startItem(): number {
    return (this.pagination().currentPage - 1) * this.pagination().pageSize + 1
  }

  protected get endItem(): number {
    const end = this.pagination().currentPage * this.pagination().pageSize
    return Math.min(end, this.pagination().totalItems)
  }
}
