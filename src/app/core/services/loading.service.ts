import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private _loading = signal(false);
  private _loadingCount = signal(0);

  // Public readonly signal
  public readonly loading = this._loading.asReadonly();

  /**
   * Show loading spinner
   */
  show(): void {
    this._loadingCount.update(count => count + 1);
    this._loading.set(true);
  }

  /**
   * Hide loading spinner
   */
  hide(): void {
    this._loadingCount.update(count => {
      const newCount = Math.max(0, count - 1);
      if (newCount === 0) {
        this._loading.set(false);
      }
      return newCount;
    });
  }

  /**
   * Force hide loading spinner
   */
  forceHide(): void {
    this._loadingCount.set(0);
    this._loading.set(false);
  }

  /**
   * Get current loading count
   */
  get loadingCount(): number {
    return this._loadingCount();
  }
}