import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http'
import { ApplicationConfig, importProvidersFrom } from '@angular/core'
import {
  Analytics,
  getAnalytics,
  provideAnalytics,
  ScreenTrackingService
} from '@angular/fire/analytics'
import {
  FirebaseApp,
  FirebaseOptions,
  initializeApp,
  provideFirebaseApp
} from '@angular/fire/app'
import { provideRouter } from '@angular/router'
import { loadingInterceptor } from '@core/interceptors/loading.interceptor'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { environment } from '../environments/environment'
import { routes } from './app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([loadingInterceptor])),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (http: HttpClient): TranslateHttpLoader => {
            return new TranslateHttpLoader(http, './assets/i18n/', '.json')
          },
          deps: [HttpClient]
        },
        defaultLanguage: 'pt-BR'
      })
    ),
    provideFirebaseApp(
      (): FirebaseApp => initializeApp(<FirebaseOptions>environment.firebase)
    ),
    provideAnalytics((): Analytics => getAnalytics()),
    ScreenTrackingService
  ]
}
