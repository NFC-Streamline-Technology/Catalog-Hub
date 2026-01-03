import { Type } from '@angular/core'
import { Routes } from '@angular/router'
import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { ProductsComponent } from './pages/products/products.component'

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: (): Promise<Type<DashboardComponent>> =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'products',
    loadComponent: (): Promise<Type<ProductsComponent>> =>
      import('./pages/products/products.component').then(m => m.ProductsComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
]
