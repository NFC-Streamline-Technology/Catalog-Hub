export interface Product {
  id: number
  title: string
  description: string
  price: number
  discountPercentage?: number
  rating?: number
  stock: number
  brand?: string
  category: string
  thumbnail?: string
  images?: string[]
}

export interface ProductsResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}

export interface CreateProductRequest {
  title: string
  description: string
  price: number
  stock: number
  brand?: string
  category: string
  images?: string[]
}

export interface UpdateProductRequest extends CreateProductRequest {
  id: number
}

export interface PaginationState {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface ImageUpload {
  file: File | null
  url: string
}
