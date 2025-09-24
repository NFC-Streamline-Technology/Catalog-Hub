import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateService } from "@ngx-translate/core";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-confirm-dialog",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./confirm-dialog.component.html",
})
export class ConfirmDialogComponent implements OnInit {
  private readonly translateService = inject(TranslateService);

  public readonly isVisible = input<boolean>(false);
  public readonly message = input<string>("");
  public readonly confirmed = output<void>();
  public readonly cancelled = output<void>();

  protected readonly translate = signal<any>(null);

  async ngOnInit(): Promise<void> {
    await this.buildTranslate();
  }

  private async buildTranslate(): Promise<void> {
    const location = "pages.products";
    const translate = await firstValueFrom(this.translateService.get(location));
    const generic = await firstValueFrom(this.translateService.get("generic"));

    this.translate.set({ ...translate, generic });
  }

  protected onConfirm(): void {
    this.confirmed.emit();
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }
}
