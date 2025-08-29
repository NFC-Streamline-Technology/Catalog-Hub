import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-8">
            <h1 class="text-2xl font-bold text-gray-900">
              📦 {{ 'Catalog Hub' }}
            </h1>
            
            <!-- Navigation Menu -->
            <nav class="hidden md:flex space-x-6">
              <a 
                routerLink="/dashboard" 
                routerLinkActive="text-primary-600 border-b-2 border-primary-600"
                class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200"
              >
                Dashboard
              </a>
              <a 
                routerLink="/products" 
                routerLinkActive="text-primary-600 border-b-2 border-primary-600"
                class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200"
              >
                {{ productsTranslate?.title || 'Produtos' }}
              </a>
            </nav>
          </div>
          
          <div class="flex items-center space-x-2">
            <select 
              (change)="changeLanguage($event)"
              class="form-input py-1 text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="pt-BR">🇧🇷 Português</option>
              <option value="en-US">🇺🇸 English</option>
              <option value="es-ES">🇪🇸 Español</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent implements OnInit {
  private translateService = inject(TranslateService);
  protected dashboardTranslate: any;
  protected productsTranslate: any;

  async ngOnInit(): Promise<void> {
    await this.buildTranslate();
    
    // Listen for language changes
    this.translateService.onLangChange.subscribe(() => {
      this.buildTranslate();
    });
  }

  private async buildTranslate(): Promise<void> {
    try {
      const dashboardTranslate = await firstValueFrom(this.translateService.get('pages.dashboard'));
      const productsTranslate = await firstValueFrom(this.translateService.get('pages.products'));

      this.dashboardTranslate = dashboardTranslate;
      this.productsTranslate = productsTranslate;
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  }

  changeLanguage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const language = target.value;
    this.translateService.use(language);
  }
}