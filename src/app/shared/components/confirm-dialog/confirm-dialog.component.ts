import { CommonModule } from '@angular/common'
import { Component, OnInit, inject, input, output, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { TranslateService } from '@ngx-translate/core'
import { ProductsTranslations } from '@shared/models/translate.model'
import { firstValueFrom } from 'rxjs'

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent implements OnInit {
  private readonly translateService = inject(TranslateService)

  constructor() {
    // Listen for language changes
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(async (): Promise<void> => {
        await this.buildTranslate()
      })
  }

  public readonly isVisible = input<boolean>(false)
  public readonly message = input<string>('')
  public readonly confirmed = output<void>()
  public readonly cancelled = output<void>()

  protected readonly translate = signal<ProductsTranslations | null>(null)

  async ngOnInit(): Promise<void> {
    await this.buildTranslate()
  }

  protected onConfirm(): void {
    this.confirmed.emit()
  }

  protected onCancel(): void {
    this.cancelled.emit()
  }

  private async buildTranslate(): Promise<void> {
    const location = 'pages.products'
    const translate = await firstValueFrom(this.translateService.get(location))
    const generic = await firstValueFrom(this.translateService.get('generic'))

    this.translate.set({ ...translate, generic })
  }
}
