import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class LoadingService {
  private readonly _loading = signal(false);
  private readonly _loadingCount = signal(0);

  public readonly loading = this._loading.asReadonly();

  /**
   * Show loading spinner
   */
  public show(): void {
    this._loadingCount.update((count): number => count + 1);
    this._loading.set(true);
  }

  /**
   * Hide loading spinner
   */
  public hide(): void {
    this._loadingCount.update((count): number => {
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
  public forceHide(): void {
    this._loadingCount.set(0);
    this._loading.set(false);
  }

  /**
   * Get current loading count
   */
  public get loadingCount(): number {
    return this._loadingCount();
  }
}
