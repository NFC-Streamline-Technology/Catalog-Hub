import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" (click)="onCancel()">
      <div class="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ translate?.generic?.confirm || 'Confirmar' }}
        </h3>
        
        <p class="text-gray-600 mb-6">
          {{ message }}
        </p>
        
        <div class="flex justify-end space-x-3">
          <button 
            type="button"
            class="btn-secondary"
            (click)="onCancel()"
          >
            {{ translate?.generic?.cancel || 'Cancelar' }}
          </button>
          <button 
            type="button"
            class="btn-danger"
            (click)="onConfirm()"
          >
            {{ translate?.generic?.yes || 'Sim' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent implements OnInit {
  @Input() isVisible = false;
  @Input() message = '';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private translateService = inject(TranslateService);
  protected translate: any;

  async ngOnInit(): Promise<void> {
    await this.buildTranslate();
  }

  private async buildTranslate(): Promise<void> {
    const location = 'pages.products';
    const translate = await firstValueFrom(this.translateService.get(location));
    const generic = await firstValueFrom(this.translateService.get('generic'));

    this.translate = { ...translate, generic };
  }

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}