import { CommonModule } from '@angular/common'
import { Component, OnInit, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { RouterModule } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { HeaderTranslations } from '@shared/models/translate.model'
import { firstValueFrom } from 'rxjs'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  private readonly translateService = inject(TranslateService)

  constructor() {
    // Listen for language changes
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(async (): Promise<void> => {
        await this.buildTranslate()
      })
  }

  protected readonly translate = signal<HeaderTranslations | null>(null)

  async ngOnInit(): Promise<void> {
    await this.buildTranslate()
  }

  protected changeLanguage(event: Event): void {
    const target = event.target as HTMLSelectElement
    const language = target.value
    this.translateService.use(language)
  }

  private async buildTranslate(): Promise<void> {
    const translate = await firstValueFrom(this.translateService.get('header'))

    this.translate.set({ ...translate })
  }
}
