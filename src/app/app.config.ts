import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { HttpClient } from "@angular/common/http";
import { routes } from "./app.routes";
import { loadingInterceptor } from "./core/interceptors/loading.interceptor";
import {
  FirebaseApp,
  initializeApp,
  provideFirebaseApp,
  FirebaseOptions,
} from "@angular/fire/app";
import {
  Analytics,
  getAnalytics,
  provideAnalytics,
  ScreenTrackingService,
} from "@angular/fire/analytics";

// Factory function for translation loader
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([loadingInterceptor])),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
        defaultLanguage: "pt-BR",
      })
    ),
    provideFirebaseApp(
      (): FirebaseApp =>
        initializeApp(<any>{
          projectId: "catalog-hub-73d36",
          appId: "1:450368403280:web:3692e0b4be542a5e891e55",
          storageBucket: "catalog-hub-73d36.firebasestorage.app",
          apiKey: "AIzaSyA_-uzPsxJb1eCi3IIXOeJSMYXmj2oYEns",
          authDomain: "catalog-hub-73d36.firebaseapp.com",
          messagingSenderId: "450368403280",
          measurementId: "G-NJVZTP7TWS",
          projectNumber: "450368403280",
          version: "2",
        })
    ),
    provideAnalytics((): Analytics => getAnalytics()),
    ScreenTrackingService,
  ],
};
