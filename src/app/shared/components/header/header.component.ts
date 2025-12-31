import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { firstValueFrom } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./header.component.html",
})
export class HeaderComponent implements OnInit {
  private readonly translateService = inject(TranslateService);

  protected readonly translate = signal<any>(null);

  async ngOnInit(): Promise<void> {
    await this.buildTranslate();

    // Listen for language changes
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(async (): Promise<void> => {
        await this.buildTranslate();
      });
  }

  protected changeLanguage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const language = target.value;
    this.translateService.use(language);
  }

  private async buildTranslate(): Promise<void> {
    try {
      const translate = await firstValueFrom(
        this.translateService.get("pages.products")
      );

      this.translate.set({ ...translate });
    } catch (error: unknown) {
      console.error("Error loading translations:", error);
    }
  }
}
