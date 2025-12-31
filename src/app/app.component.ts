import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { LoadingSpinnerComponent } from "./shared/components/loading-spinner/loading-spinner.component";
import { HeaderComponent } from "./shared/components/header/header.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LoadingSpinnerComponent,
    HeaderComponent,
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header />
      <main class="container mx-auto px-4 py-8">
        <router-outlet />
      </main>
      <app-loading-spinner />
    </div>
  `,
})
export class AppComponent implements OnInit {
  private translateService = inject(TranslateService);

  ngOnInit(): void {
    // Set default language
    this.translateService.setDefaultLang("pt-BR");
    this.translateService.use("pt-BR");
  }
}
