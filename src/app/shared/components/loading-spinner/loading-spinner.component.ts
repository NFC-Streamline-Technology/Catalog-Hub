import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoadingService } from "../../../core/services/loading.service";
import { TranslateService } from "@ngx-translate/core";
import { firstValueFrom } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-loading-spinner",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="loadingService.loading()"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25"
    >
      <div class="bg-white rounded-lg p-6 shadow-xl">
        <div class="flex items-center space-x-3">
          <div class="spinner w-6 h-6"></div>

          <span class="text-gray-700 font-medium">
            {{ translate()?.loading }}
          </span>
        </div>
      </div>
    </div>
  `,
})
export class LoadingSpinnerComponent implements OnInit {
  constructor() {
    // Listen for language changes
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(async (): Promise<void> => {
        await this.buildTranslate();
      });
  }

  protected readonly loadingService = inject(LoadingService);
  protected readonly translateService = inject(TranslateService);

  protected translate = signal<any>(null);

  async ngOnInit(): Promise<void> {
    // Initialize translations for the current language
    await this.buildTranslate();
  }

  private async buildTranslate(): Promise<void> {
    const translate = await firstValueFrom(
      this.translateService.get("generic")
    );

    this.translate.set(translate);
  }
}
