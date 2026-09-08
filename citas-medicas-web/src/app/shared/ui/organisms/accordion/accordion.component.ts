import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="accordion" [class.accordion-flush]="flush">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .accordion {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }

      .accordion-flush {
        gap: 0;
      }

      .accordion-flush ::ng-deep .accordion-item {
        border-radius: 0;
        border-inline: none;
      }

      .accordion-flush ::ng-deep app-accordion-item:first-child .accordion-item {
        border-top: none;
      }
    `,
  ],
})
export class AccordionComponent {
  @Input() flush = false;
  @Input() single = false;

  private readonly items: AccordionItemComponent[] = [];

  register(item: AccordionItemComponent): void {
    this.items.push(item);
    if (this.single && item.isOpen()) {
      this.closeOtherItems(item);
    }
  }

  unregister(item: AccordionItemComponent): void {
    const index = this.items.indexOf(item);
    if (index >= 0) {
      this.items.splice(index, 1);
    }
  }

  requestToggle(item: AccordionItemComponent): void {
    const nextOpen = !item.isOpen();
    if (nextOpen && this.single) {
      this.closeOtherItems(item);
    }
    item.setOpen(nextOpen, true);
  }

  moveFocus(item: AccordionItemComponent, key: string): boolean {
    const enabledItems = this.items.filter((candidate) => !candidate.disabled);
    const currentIndex = enabledItems.indexOf(item);
    if (currentIndex < 0 || enabledItems.length === 0) {
      return false;
    }

    let nextIndex: number;
    switch (key) {
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % enabledItems.length;
        break;
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = enabledItems.length - 1;
        break;
      default:
        return false;
    }

    enabledItems[nextIndex]?.focusHeader();
    return true;
  }

  private closeOtherItems(openItem: AccordionItemComponent): void {
    for (const item of this.items) {
      if (item !== openItem && item.isOpen()) {
        item.setOpen(false, true);
      }
    }
  }
}

/**
 * Elemento colapsable accesible. Debe utilizarse dentro de `app-accordion`.
 *
 * El encabezado es un botón nativo, mantiene relaciones ARIA completas y
 * participa en la navegación opcional con flechas, Home y End del organismo.
 */
@Component({
  selector: 'app-accordion-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="accordion-item" [class.open]="isOpen()" [class.disabled]="disabled">
      <button
        #header
        type="button"
        class="accordion-header"
        [id]="headerId"
        [disabled]="disabled"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="contentId"
        (click)="toggle()"
        (keydown)="handleHeaderKeydown($event)"
      >
        <span class="accordion-heading">
          <span class="accordion-title">{{ title }}</span>
          @if (description) {
            <span class="accordion-description">{{ description }}</span>
          }
        </span>
        <span class="accordion-icon" aria-hidden="true">
          <i class="fa-solid fa-chevron-down"></i>
        </span>
      </button>
      <div
        class="accordion-content"
        [id]="contentId"
        role="region"
        [attr.aria-labelledby]="headerId"
        [attr.aria-hidden]="!isOpen()"
        [attr.inert]="isOpen() ? null : ''"
      >
        <div class="accordion-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .accordion-item {
        overflow: hidden;
        border: thin solid var(--border-color);
        border-radius: var(--radius-md);
        background: var(--surface-background);
      }

      .accordion-header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
        padding: var(--space-3) var(--space-4);
        border: none;
        border-bottom: thin solid transparent;
        background: var(--surface-section);
        color: var(--text-color);
        text-align: start;
        cursor: pointer;
        transition:
          background-color 150ms ease,
          border-color 150ms ease,
          color 150ms ease;
      }

      .accordion-header:hover:not(:disabled) {
        background: var(--hover-background);
      }

      .accordion-header:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
      }

      .accordion-header:disabled {
        cursor: not-allowed;
        opacity: 0.65;
      }

      .accordion-heading {
        min-width: 0;
        display: grid;
        gap: var(--space-1);
      }

      .accordion-title {
        font-size: var(--text-md);
        font-weight: 600;
      }

      .accordion-description {
        color: var(--text-color-secondary);
        font-size: var(--text-xs);
        font-weight: 400;
      }

      .accordion-item.open .accordion-header {
        border-bottom-color: var(--border-color);
        background: var(--hover-background);
        color: var(--primary-color);
      }

      .accordion-icon {
        flex: 0 0 auto;
        color: var(--text-color-muted);
        font-size: var(--text-xs);
        transition:
          color 150ms ease,
          transform 200ms ease;
      }

      .accordion-item.open .accordion-icon {
        color: var(--primary-color);
        transform: rotate(180deg);
      }

      .accordion-content {
        display: grid;
        grid-template-rows: 0fr;
        background: var(--surface-background);
        transition: grid-template-rows 200ms ease;
      }

      .accordion-item.open .accordion-content {
        grid-template-rows: 1fr;
      }

      .accordion-body {
        min-height: 0;
        overflow: hidden;
        padding-inline: var(--space-4);
        color: var(--text-color-secondary);
        font-size: var(--text-sm);
        line-height: 1.6;
      }

      .accordion-item.open .accordion-body {
        padding-block: var(--space-4);
      }

      @media (prefers-reduced-motion: reduce) {
        .accordion-header,
        .accordion-icon,
        .accordion-content {
          transition: none;
        }
      }
    `,
  ],
})
export class AccordionItemComponent implements OnInit, OnDestroy {
  private static nextId = 0;

  private readonly accordion = inject(AccordionComponent, { optional: true });
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input() id = `accordion-${++AccordionItemComponent.nextId}`;
  @Input() title = '';
  @Input() description = '';
  @Input() disabled = false;
  @Input() set open(value: boolean) {
    this.setOpen(value, false);
  }
  @Output() readonly openChange = new EventEmitter<boolean>();

  readonly isOpen = signal(false);

  get headerId(): string {
    return `${this.id}-header`;
  }

  get contentId(): string {
    return `${this.id}-content`;
  }

  ngOnInit(): void {
    this.accordion?.register(this);
  }

  ngOnDestroy(): void {
    this.accordion?.unregister(this);
  }

  toggle(): void {
    if (this.disabled) {
      return;
    }

    if (this.accordion) {
      this.accordion.requestToggle(this);
      return;
    }

    this.setOpen(!this.isOpen(), true);
  }

  setOpen(value: boolean, emit: boolean): void {
    if (this.isOpen() === value) {
      return;
    }

    if (!value) {
      this.focusHeaderWhenContentContainsFocus();
    }
    this.isOpen.set(value);
    if (emit) {
      this.openChange.emit(value);
    }
  }

  focusHeader(): void {
    this.elementRef.nativeElement
      .querySelector<HTMLButtonElement>('.accordion-header')
      ?.focus();
  }

  private focusHeaderWhenContentContainsFocus(): void {
    const host = this.elementRef.nativeElement;
    const content = host.querySelector<HTMLElement>('.accordion-content');
    const activeElement = host.ownerDocument.activeElement;
    if (content && activeElement && content.contains(activeElement)) {
      this.focusHeader();
    }
  }

  handleHeaderKeydown(event: KeyboardEvent): void {
    if (this.accordion?.moveFocus(this, event.key)) {
      event.preventDefault();
    }
  }
}
