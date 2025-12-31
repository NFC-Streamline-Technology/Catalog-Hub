import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import {
  Product,
  ProductsResponse,
  CreateProductRequest,
  UpdateProductRequest,
} from "../../shared/models/product.model";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = "https://dummyjson.com";
  private readonly url = new URL(`${this.baseUrl}/products`);

  /**
   * Get all products with optional search and pagination
   */
  public getProducts(
    search: string = "",
    limit: number = 12,
    skip: number = 0
  ): Observable<ProductsResponse> {
    const url = new URL(`${this.url.href}/search`);

    url.searchParams.set("limit", limit.toString());
    url.searchParams.set("skip", skip.toString());
    search && url.searchParams.set("q", encodeURIComponent(search));

    return this.http.get<ProductsResponse>(url.href).pipe(
      catchError((error): Observable<ProductsResponse> => {
        console.error("Error fetching products:", error);
        return of({ products: [], total: 0, skip: 0, limit: 0 });
      })
    );
  }

  /**
   * Get a single product by ID
   */
  public getProduct(id: number): Observable<Product | null> {
    return this.http.get<Product>(`${this.url.href}/${id}`).pipe(
      catchError((error): Observable<null> => {
        console.error("Error fetching product:", error);
        return of(null);
      })
    );
  }

  /**
   * Create a new product
   * Note: DummyJSON API simulates creation but doesn't persist data
   */
  public createProduct(
    product: CreateProductRequest
  ): Observable<Product | null> {
    return this.http
      .post<Product>(`${this.url.href}/add`, product)
      .pipe(
        catchError((error): Observable<null> => {
          console.error("Error creating product:", error);
          return of(null);
        })
      );
  }

  /**
   * Update an existing product
   * Note: DummyJSON API simulates update but doesn't persist data
   */
  public updateProduct(
    id: number,
    product: UpdateProductRequest
  ): Observable<Product | null> {
    return this.http
      .put<Product>(`${this.url.href}/${id}`, product)
      .pipe(
        catchError((error): Observable<null> => {
          console.error("Error updating product:", error);
          return of(null);
        })
      );
  }

  /**
   * Delete a product
   * Note: DummyJSON API simulates deletion but doesn't persist data
   */
  public deleteProduct(id: number): Observable<boolean> {
    return this.http.delete<Product>(`${this.url.href}/${id}`).pipe(
      map((): boolean => true),
      catchError((error): Observable<boolean> => {
        console.error("Error deleting product:", error);
        return of(false);
      })
    );
  }

  /**
   * Get ALL products without pagination (for dashboard calculations)
   */
  public getAllProducts(): Observable<Product[]> {
    this.url.searchParams.set("limit", "0");
    return this.http
      .get<ProductsResponse>(this.url.href)
      .pipe(
        map((response): Product[] => response.products),
        catchError((error): Observable<Product[]> => {
          console.error("Error fetching all products:", error);
          return of([]);
        })
      );
  }

  /**
   * Get product categories
   */
  public getCategories(): Observable<string[]> {
    return this.http
      .get<Record<string, string>[]>(`${this.url.href}/categories`)
      .pipe(
        map((categories): string[] => {
          return categories.map((category: any): string => category.slug);
        }),
        catchError((error): Observable<string[]> => {
          console.error("Error fetching categories:", error);
          return of([]);
        })
      );
  }
}
