import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Product, ProductsResponse, CreateProductRequest, UpdateProductRequest } from '../../shared/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://dummyjson.com';

  /**
   * Get all products with optional search, category filter and pagination
   */
  getProducts(searchQuery?: string, category?: string, limit: number = 12, skip: number = 0): Observable<ProductsResponse> {
    let url: string;
    
    if (category && category !== 'all') {
      url = `${this.baseUrl}/products/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`;
    } else if (searchQuery) {
      url = `${this.baseUrl}/products/search?q=${encodeURIComponent(searchQuery)}&limit=${limit}&skip=${skip}`;
    } else {
      url = `${this.baseUrl}/products?limit=${limit}&skip=${skip}`;
    }

    return this.http.get<ProductsResponse>(url).pipe(
      catchError(error => {
        console.error('Error fetching products:', error);
        return of({ products: [], total: 0, skip: 0, limit: 0 });
      })
    );
  }

  /**
   * Get a single product by ID
   */
  getProduct(id: number): Observable<Product | null> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching product:', error);
        return of(null);
      })
    );
  }

  /**
   * Create a new product
   * Note: DummyJSON API simulates creation but doesn't persist data
   */
  createProduct(product: CreateProductRequest): Observable<Product | null> {
    return this.http.post<Product>(`${this.baseUrl}/products/add`, product).pipe(
      catchError(error => {
        console.error('Error creating product:', error);
        return of(null);
      })
    );
  }

  /**
   * Update an existing product
   * Note: DummyJSON API simulates update but doesn't persist data
   */
  updateProduct(product: UpdateProductRequest): Observable<Product | null> {
    return this.http.put<Product>(`${this.baseUrl}/products/${product.id}`, product).pipe(
      catchError(error => {
        console.error('Error updating product:', error);
        return of(null);
      })
    );
  }

  /**
   * Delete a product
   * Note: DummyJSON API simulates deletion but doesn't persist data
   */
  deleteProduct(id: number): Observable<boolean> {
    return this.http.delete<Product>(`${this.baseUrl}/products/${id}`).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error deleting product:', error);
        return of(false);
      })
    );
  }

  /**
   * Get ALL products without pagination (for dashboard calculations)
   */
  getAllProducts(): Observable<Product[]> {
    return this.http.get<ProductsResponse>(`${this.baseUrl}/products?limit=0`).pipe(
      map(response => response.products),
      catchError(error => {
        console.error('Error fetching all products:', error);
        return of([]);
      })
    );
  }

  /**
   * Get product categories
   */
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/products/categories`).pipe(
      catchError(error => {
        console.error('Error fetching categories:', error);
        return of([]);
      })
    );
  }
}