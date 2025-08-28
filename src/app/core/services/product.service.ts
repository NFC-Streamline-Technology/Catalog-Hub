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
   * Get all products with optional search
   */
  getProducts(searchQuery?: string): Observable<Product[]> {
    const url = searchQuery 
      ? `${this.baseUrl}/products/search?q=${encodeURIComponent(searchQuery)}`
      : `${this.baseUrl}/products?limit=100`;

    return this.http.get<ProductsResponse>(url).pipe(
      map(response => response.products),
      catchError(error => {
        console.error('Error fetching products:', error);
        return of([]);
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