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
import { PaginationState } from "../../models/product.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-pagination",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="pagination.totalPages > 1"
      class="flex items-center justify-between px-4 py-3 sm:px-6"
    >
      <div class="flex flex-1 justify-between sm:hidden">
        <button
          (click)="onPageChange(pagination.currentPage - 1)"
          [disabled]="pagination.currentPage === 1"
          class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ translate?.previous }}
        </button>
        <button
          (click)="onPageChange(pagination.currentPage + 1)"
          [disabled]="pagination.currentPage === pagination.totalPages"
          class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ translate?.next }}
        </button>
      </div>

      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            {{ translate?.showing }}
            <span class="font-medium">{{ getStartItem() }}</span>
            {{ translate?.to }}
            <span class="font-medium">{{ getEndItem() }}</span>
            {{ translate?.of }}
            <span class="font-medium">{{ pagination.totalItems }}</span>
            {{ translate?.results }}
          </p>
        </div>
        <div>
          <nav
            class="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <!-- Previous button -->
            <button
              (click)="onPageChange(pagination.currentPage - 1)"
              [disabled]="pagination.currentPage === 1"
              class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">{{ translate?.previous }}</span>
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
            <button
              *ngFor="let page of getVisiblePages()"
              (click)="onPageChange(page)"
              [class]="getPageButtonClass(page)"
              [disabled]="page === -1"
            >
              {{ page === -1 ? "..." : page }}
            </button>

            <!-- Next button -->
            <button
              (click)="onPageChange(pagination.currentPage + 1)"
              [disabled]="pagination.currentPage === pagination.totalPages"
              class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">{{ translate?.next }}</span>
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
  `,
})
export class PaginationComponent implements OnInit {
  constructor() {
    // Listen for language changes
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(async (): Promise<void> => {
        await this.buildTranslate();
      });
  }

  @Input({ required: true }) pagination!: PaginationState;
  @Output() pageChanged = new EventEmitter<number>();

  private translateService = inject(TranslateService);
  protected translate: any;

  async ngOnInit(): Promise<void> {
    await this.buildTranslate();
  }

  private async buildTranslate(): Promise<void> {
    const generic = await firstValueFrom(this.translateService.get("generic"));
    const pagination = await firstValueFrom(
      this.translateService.get("pagination")
    );

    this.translate = { ...generic, ...pagination };
  }

  protected onPageChange(page: number): void {
    if (
      page >= 1 &&
      page <= this.pagination.totalPages &&
      page !== this.pagination.currentPage
    ) {
      this.pageChanged.emit(page);
    }
  }

  protected getStartItem(): number {
    return (this.pagination.currentPage - 1) * this.pagination.pageSize + 1;
  }

  protected getEndItem(): number {
    const end = this.pagination.currentPage * this.pagination.pageSize;
    return Math.min(end, this.pagination.totalItems);
  }

  protected getVisiblePages(): number[] {
    const totalPages: number = this.pagination.totalPages;
    const currentPage: number = this.pagination.currentPage;
    const pages: number[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push(-1); // ellipsis
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // ellipsis
        pages.push(totalPages);
      }
    }

    return pages;
  }

  protected getPageButtonClass(page: number): string {
    if (page === -1) {
      return "relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 cursor-default";
    }

    const baseClass =
      "relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 transition-colors duration-200";

    if (page === this.pagination.currentPage) {
      return `${baseClass} z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600`;
    }

    return `${baseClass} text-gray-900 hover:text-primary-600`;
  }
}
