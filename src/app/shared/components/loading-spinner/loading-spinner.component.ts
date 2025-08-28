import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loadingService.loading()" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25">
      <div class="bg-white rounded-lg p-6 shadow-xl">
        <div class="flex items-center space-x-3">
          <div class="spinner w-6 h-6"></div>
          <span class="text-gray-700 font-medium">Carregando...</span>
        </div>
      </div>
    </div>
  `
})
export class LoadingSpinnerComponent {
  protected loadingService = inject(LoadingService);
}