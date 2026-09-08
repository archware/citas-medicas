import {
  afterNextRender,
  AfterRenderRef,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ScrollOverlayComponent } from '../scroll-overlay/scroll-overlay.component';

const DEFAULT_FOCUS_SELECTORS = [
  '[data-dialog-initial-focus]:not([disabled]):not([hidden]):not([aria-hidden="true"]):not([aria-disabled="true"])',
  '[data-control-focus]:not([disabled]):not([hidden]):not([aria-hidden="true"]):not([aria-disabled="true"])',
  'input:not([type="hidden"]):not([disabled]):not([hidden]):not([tabindex="-1"]):not([aria-hidden="true"]):not([aria-disabled="true"])',
  'select:not([disabled]):not([hidden]):not([tabindex="-1"]):not([aria-hidden="true"]):not([aria-disabled="true"])',
  'textarea:not([disabled]):not([hidden]):not([tabindex="-1"]):not([aria-hidden="true"]):not([aria-disabled="true"])',
  'button:not([disabled]):not([hidden]):not([tabindex="-1"]):not([aria-hidden="true"]):not([aria-disabled="true"])',
  '[href]:not([hidden]):not([tabindex="-1"]):not([aria-hidden="true"]):not([aria-disabled="true"])',
  '[tabindex]:not([tabindex="-1"]):not([hidden]):not([aria-hidden="true"]):not([aria-disabled="true"])',
] as const;

const INVALID_FOCUS_SELECTORS = [
  '[aria-invalid="true"][data-dialog-initial-focus]:not([disabled]):not([hidden])',
  'input.ng-invalid:not([type="hidden"]):not([disabled]):not([hidden]):not([tabindex="-1"])',
  'select.ng-invalid:not([disabled]):not([hidden]):not([tabindex="-1"])',
  'textarea.ng-invalid:not([disabled]):not([hidden]):not([tabindex="-1"])',
  '[aria-invalid="true"]:not([disabled]):not([hidden]):not([tabindex="-1"]):not([aria-hidden="true"]):not([aria-disabled="true"])',
] as const;

const ERROR_FOCUS_SELECTORS = [
  '[data-dialog-error]:not([hidden]):not([aria-hidden="true"])',
  '[data-modal-error]:not([hidden]):not([aria-hidden="true"])',
  '[role="alert"]:not([hidden]):not([aria-hidden="true"])',
  ...INVALID_FOCUS_SELECTORS,
] as const;

/**
 * Organismo modal canónico para altas y ediciones CRUD.
 * Conserva el foco, la semántica nativa de dialog y permite proyectar formularios completos.
 */
@Component({
  selector: 'app-crud-dialog, prest-crud-dialog',
  imports: [ScrollOverlayComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './crud-dialog.html',
  styleUrl: './crud-dialog.scss',
})
export class CrudDialog {
  readonly panelClass = input('');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly labelledBy = input.required<string>();
  readonly describedBy = input<string | null>(null);
  readonly cancelled = output<Event>();
  readonly closed = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('nativeDialog');
  private readonly scrollSurface = viewChild.required<ElementRef<HTMLElement>>('scrollSurface');
  private readonly injector = inject(Injector);
  private returnFocusTarget: HTMLElement | null = null;
  private pendingErrorFocus?: AfterRenderRef;

  get nativeElement(): HTMLDialogElement {
    return this.dialog().nativeElement;
  }

  get open(): boolean {
    return this.nativeElement.open;
  }

  showModal(focusSelectors: string | readonly string[] = DEFAULT_FOCUS_SELECTORS): void {
    const element = this.nativeElement;
    if (!element.open) {
      const activeElement = element.ownerDocument.activeElement;
      this.returnFocusTarget =
        activeElement instanceof HTMLElement &&
        activeElement !== element.ownerDocument.body &&
        !element.contains(activeElement)
          ? activeElement
          : null;
      if (typeof element.showModal === 'function') {
        element.showModal();
      } else {
        element.setAttribute('open', '');
      }
    }
    element.scrollTop = 0;
    this.scrollSurface().nativeElement.scrollTop = 0;
    this.focusFirst(element, focusSelectors);
  }

  close(returnValue?: string): void {
    const element = this.nativeElement;
    if (!element.open) {
      return;
    }
    if (typeof element.close === 'function') {
      element.close(returnValue);
    } else {
      element.removeAttribute('open');
      this.handleClosed();
    }
  }

  focusInvalid(): void {
    this.focusFirst(this.nativeElement, INVALID_FOCUS_SELECTORS);
  }

  /**
   * Focuses visible operation feedback or falls back to the first invalid control.
   * When projected feedback is still pending, it retries once after Angular renders.
   */
  focusError(): boolean {
    const focused = this.focusFirst(this.nativeElement, ERROR_FOCUS_SELECTORS);
    if (focused) {
      this.pendingErrorFocus?.destroy();
      this.pendingErrorFocus = undefined;
      return true;
    }

    this.pendingErrorFocus?.destroy();
    this.pendingErrorFocus = afterNextRender({
      write: () => {
        this.pendingErrorFocus = undefined;
        this.focusFirst(this.nativeElement, ERROR_FOCUS_SELECTORS);
      },
    }, { injector: this.injector });
    return false;
  }

  private focusFirst(root: ParentNode, selectors: string | readonly string[]): boolean {
    const selectorList = typeof selectors === 'string' ? [selectors] : selectors;
    for (const selector of selectorList) {
      const target = root.querySelector<HTMLElement>(selector);
      if (target) {
        target.focus({ preventScroll: true });
        return true;
      }
    }
    return false;
  }

  protected handleCancel(event: Event): void {
    event.preventDefault();
    this.cancelled.emit(event);
  }

  protected handleClosed(): void {
    this.closed.emit();
    const target = this.returnFocusTarget;
    this.returnFocusTarget = null;
    if (target?.isConnected) {
      queueMicrotask(() => target.focus({ preventScroll: true }));
    }
  }
}
