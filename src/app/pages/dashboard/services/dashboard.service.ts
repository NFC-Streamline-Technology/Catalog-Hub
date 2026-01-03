import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { Product, ProductsResponse } from '@shared/models/product.model'
import { Observable, of } from 'rxjs'
import { catchError, first, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = 'https://dummyjson.com/products'

  /**
   * Get ALL products without pagination (for dashboard calculations)
   */
  public getAllProducts(): Observable<Product[]> {
    const url = new URL(`${this.baseUrl}`)
    url.searchParams.set('limit', '0')

    return this.http.get<ProductsResponse>(url.href).pipe(
      first(),
      map((response): Product[] => response.products),
      catchError((error): Observable<Product[]> => {
        console.error('Error fetching all products:', error)
        return of([])
      })
    )
  }

  /**
   * Get product categories
   */
  public getCategories(): Observable<string[]> {
    return this.http.get<Record<string, string>[]>(`${this.baseUrl}/categories`).pipe(
      first(),
      map((categories): string[] => {
        return categories.map((category: any): string => category.slug)
      }),
      catchError((error): Observable<string[]> => {
        console.error('Error fetching categories:', error)
        return of([])
      })
    )
  }
}
