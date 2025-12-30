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

  /**
   * Get all products with optional search and pagination
   */
  public getProducts(
    searchQuery?: string,
    limit: number = 12,
    skip: number = 0
  ): Observable<ProductsResponse> {
    let url: string = `${this.baseUrl}/products?limit=${limit}&skip=${skip}`;

    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }

    return this.http.get<ProductsResponse>(url).pipe(
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
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`).pipe(
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
      .post<Product>(`${this.baseUrl}/products/add`, product)
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
    product: UpdateProductRequest
  ): Observable<Product | null> {
    return this.http
      .put<Product>(`${this.baseUrl}/products/${product.id}`, product)
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
    return this.http.delete<Product>(`${this.baseUrl}/products/${id}`).pipe(
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
    return this.http
      .get<ProductsResponse>(`${this.baseUrl}/products?limit=0`)
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
    return this.http.get<string[]>(`${this.baseUrl}/products/categories`).pipe(
      catchError((error): Observable<string[]> => {
        console.error("Error fetching categories:", error);
        return of([]);
      })
    );
  }
}
