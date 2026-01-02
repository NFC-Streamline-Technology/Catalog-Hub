import { Injectable, Signal, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class LoadingService {
  private readonly loading = signal(false);
  private readonly currentLoadingCount = signal(0);


  /**
   * Show loading spinner
   */
  public show(): void {
    this.currentLoadingCount.update((count): number => count + 1);
    this.loading.set(true);
  }

  /**
   * Hide loading spinner
   */
  public hide(): void {
    this.currentLoadingCount.update((count): number => {
      const newCount = Math.max(0, count - 1);
      if (newCount === 0) {
        this.loading.set(false);
      }

      return newCount;
    });
  }

  /**
   * Force hide loading spinner
   */
  public forceHide(): void {
    this.currentLoadingCount.set(0);
    this.loading.set(false);
  }

  /**
   * Get current loading count
   */
  public get loadingCount(): number {
    return this.currentLoadingCount();
  }

  /**
   * Get current loading state
   */
  public get isLoading(): Signal<boolean> {
    return this.loading.asReadonly();
  }
}
