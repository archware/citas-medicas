import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { CrudDialog } from '../crud-dialog/crud-dialog';

const FORM_FOCUS_SELECTORS = [
  '.form-dialog__body [data-dialog-initial-focus]:not([disabled]):not([hidden]):not([aria-hidden="true"]):not([aria-disabled="true"])',
  '.form-dialog__body [data-control-focus]:not([disabled]):not([hidden]):not([aria-hidden="true"]):not([aria-disabled="true"])',
  '.form-dialog__body input:not([type="hidden"]):not([disabled]):not([hidden]):not([tabindex="-1"]):not([aria-hidden="true"]):not([aria-disabled="true"])',
  '.form-dialog__body select:not([disabled]):not([hidden]):not([tabindex="-1"]):not([aria-hidden="true"]):not([aria-disabled="true"])',
  '.form-dialog__body textarea:not([disabled]):not([hidden]):not([tabindex="-1"]):not([aria-hidden="true"]):not([aria-disabled="true"])',
  '.form-dialog__body button:not([disabled]):not([hidden]):not([tabindex="-1"]):not([aria-hidden="true"]):not([aria-disabled="true"])',
  '[dialog-close] button:not([disabled]):not([hidden]):not([tabindex="-1"]):not([aria-hidden="true"]):not([aria-disabled="true"])',
] as const;

/**
 * Diálogo de formulario con encabezado, descripción y cuerpo canónicos.
 * El consumidor conserva el formulario y las reglas de negocio. Puede enlazar
 * `[(opened)]` para control declarativo, usar la API imperativa compatible y
 * proyectar un botón Atomic con `dialog-close` para cerrar.
 */
@Component({
  selector: 'app-form-dialog, prest-form-dialog',
  imports: [CrudDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-dialog.html',
  styleUrl: './form-dialog.scss',
})
export class FormDialog {
  private static nextId = 0;
  private readonly generatedId = `prest-form-dialog-${++FormDialog.nextId}`;
  private readonly dialog = viewChild<CrudDialog>('dialog');

  readonly eyebrow = input<string | null>(null);
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly panelClass = input('');
  readonly opened = model(false);
  readonly busy = input(false);
  readonly cancelled = output<Event>();
  readonly closed = output<void>();

  protected readonly titleId = computed(() => `${this.generatedId}-title`);
  protected readonly descriptionId = computed(() => `${this.generatedId}-description`);

  constructor() {
    effect(() => {
      const dialog = this.dialog();
      if (!dialog) {
        return;
      }

      if (this.opened() && !dialog.open) {
        dialog.showModal(FORM_FOCUS_SELECTORS);
      } else if (!this.opened() && dialog.open) {
        dialog.close();
      }
    });
  }

  get nativeElement(): HTMLDialogElement {
    const dialog = this.dialog();
    if (!dialog) {
      throw new Error('FormDialog is not available before the view is initialized.');
    }
    return dialog.nativeElement;
  }

  get open(): boolean {
    return this.dialog()?.open ?? false;
  }

  showModal(): void {
    this.opened.set(true);
    this.dialog()?.showModal(FORM_FOCUS_SELECTORS);
  }

  close(returnValue?: string): void {
    this.opened.set(false);
    this.dialog()?.close(returnValue);
  }

  focusInvalid(): void {
    this.dialog()?.focusInvalid();
  }

  /**
   * Focuses projected operation feedback after an asynchronous failure.
   * CrudDialog retries after render when the feedback is not available yet.
   */
  focusError(): boolean {
    return this.dialog()?.focusError() ?? false;
  }

  protected handleCancelled(event: Event): void {
    if (!this.busy()) {
      this.cancelled.emit(event);
    }
  }

  protected handleClosed(): void {
    this.opened.set(false);
    this.closed.emit();
  }
}

/** Pie canónico para acciones principales y secundarias de un formulario modal. */
@Component({
  selector: 'app-form-dialog-actions, prest-form-dialog-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div class="form-dialog-actions"><ng-content /></div>',
  styleUrl: './form-dialog-actions.scss',
})
export class FormDialogActions {}
