import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { ImageUpload } from '../../models/product.model';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <label class="form-label">
        {{ translate?.images || 'Imagens' }}
        <span class="text-xs text-gray-500 ml-1">({{ translate?.optional || 'opcional' }})</span>
      </label>
      
      <!-- Upload Area -->
      <div 
        class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors"
        [class.border-primary-500]="dragOver"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <div class="space-y-1 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div class="flex text-sm text-gray-600">
            <label class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
              <span>{{ translate?.uploadFile || 'Fazer upload de arquivo' }}</span>
              <input 
                #fileInput
                type="file" 
                class="sr-only" 
                multiple 
                accept="image/*"
                (change)="onFileSelected($event)"
              />
            </label>
            <p class="pl-1">{{ translate?.orDragDrop || 'ou arraste e solte' }}</p>
          </div>
          <p class="text-xs text-gray-500">
            {{ translate?.imageFormats || 'PNG, JPG, GIF até 10MB cada' }}
          </p>
        </div>
      </div>

      <!-- Image Preview Grid -->
      <div *ngIf="images.length > 0" class="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div 
          *ngFor="let image of images; let i = index"
          class="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
        >
          <img 
            [src]="image.url" 
            [alt]="'Image ' + (i + 1)"
            class="w-full h-full object-cover"
          />
          
          <!-- Remove button -->
          <button
            type="button"
            (click)="removeImage(i)"
            class="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <!-- Primary indicator -->
          <div *ngIf="i === 0" class="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
            {{ translate?.primary || 'Principal' }}
          </div>
        </div>
      </div>

      <!-- URL Input for manual addition -->
      <div class="mt-4">
        <label class="form-label text-sm">
          {{ translate?.addByUrl || 'Adicionar por URL' }}
        </label>
        <div class="flex space-x-2">
          <input
            #urlInput
            type="url"
            placeholder="https://exemplo.com/imagem.jpg"
            class="form-input flex-1"
            (keydown.enter)="addImageByUrl(urlInput.value); urlInput.value = ''"
          />
          <button
            type="button"
            (click)="addImageByUrl(urlInput.value); urlInput.value = ''"
            class="btn-secondary"
          >
            {{ translate?.add || 'Adicionar' }}
          </button>
        </div>
      </div>

      <!-- Error messages -->
      <div *ngIf="errorMessage" class="mt-2 text-red-600 text-sm">
        {{ errorMessage }}
      </div>
    </div>
  `
})
export class ImageUploadComponent implements OnInit {
  @Input() images: ImageUpload[] = [];
  @Input() maxImages: number = 5;
  @Input() maxSizePerImage: number = 10 * 1024 * 1024; // 10MB
  @Output() imagesChange = new EventEmitter<ImageUpload[]>();

  private translateService = inject(TranslateService);
  protected translate: any;
  protected dragOver = false;
  protected errorMessage = '';

  async ngOnInit(): Promise<void> {
    await this.buildTranslate();
  }

  private async buildTranslate(): Promise<void> {
    const location = 'pages.products';
    const translate = await firstValueFrom(this.translateService.get(location));
    const generic = await firstValueFrom(this.translateService.get('generic'));

    this.translate = { ...translate, generic };
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    
    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.handleFiles(files);
    input.value = ''; // Reset input
  }

  private handleFiles(files: File[]): void {
    this.errorMessage = '';

    if (this.images.length + files.length > this.maxImages) {
      this.errorMessage = `Máximo de ${this.maxImages} imagens permitidas`;
      return;
    }

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Apenas arquivos de imagem são permitidos';
        return;
      }

      if (file.size > this.maxSizePerImage) {
        this.errorMessage = `Arquivo muito grande. Máximo ${this.formatFileSize(this.maxSizePerImage)}`;
        return;
      }

      this.addImageFile(file);
    });
  }

  private addImageFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUpload: ImageUpload = {
        file: file,
        url: e.target?.result as string,
        id: this.generateId()
      };

      this.images = [...this.images, imageUpload];
      this.imagesChange.emit(this.images);
    };
    reader.readAsDataURL(file);
  }

  protected addImageByUrl(url: string): void {
    if (!url.trim()) return;

    this.errorMessage = '';

    if (this.images.length >= this.maxImages) {
      this.errorMessage = `Máximo de ${this.maxImages} imagens permitidas`;
      return;
    }

    if (!this.isValidImageUrl(url)) {
      this.errorMessage = 'URL de imagem inválida';
      return;
    }

    const imageUpload: ImageUpload = {
      file: null as any, // URL-based image
      url: url,
      id: this.generateId()
    };

    this.images = [...this.images, imageUpload];
    this.imagesChange.emit(this.images);
  }

  protected removeImage(index: number): void {
    this.images = this.images.filter((_, i) => i !== index);
    this.imagesChange.emit(this.images);
  }

  private isValidImageUrl(url: string): boolean {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
    } catch {
      return false;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}