import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  forwardRef,
  inject
} from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-toggle, prest-toggle',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleComponent),
      multi: true
    }
  ],
  template: `
    <label class="toggle-wrapper" [class.disabled]="disabled">
      <input
        type="checkbox"
        role="switch"
        class="toggle-input"
        [checked]="checked"
        [disabled]="disabled"
        [attr.aria-checked]="checked"
        [attr.aria-label]="label ? null : ariaLabel"
        (change)="onToggleChange($event)"
      />
      <span class="toggle-track">
        <span class="toggle-thumb"></span>
      </span>
      @if (label) {
        <span class="toggle-label">{{ label }}</span>
      }
    </label>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .toggle-wrapper {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      cursor: pointer;
      user-select: none;
    }

    .toggle-wrapper.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .toggle-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-track {
      width: var(--space-8);          /* 4var(--space-2) → var(--space-8): respeta zoom de accesibilidad */
      height: 1.75rem;      /* 2var(--space-2) → 1.75rem */
      background: var(--border-color);
      border-radius: var(--radius-xl); /* 14px → 0.875rem */
      padding: var(--space-0, var(--space-1));
      transition: all 200ms ease;
      flex-shrink: 0;
    }

    .toggle-thumb {
      display: block;
      width: var(--space-5);        /* 24px → var(--space-5) */
      height: var(--space-5);       /* 24px → var(--space-5) */
      background: var(--surface-background);
      border-radius: 50%;
      box-shadow: var(--shadow-sm);
      transition: transform 200ms ease;
    }

    /* Hover */
    .toggle-wrapper:hover:not(.disabled) .toggle-track {
      background: var(--text-color-secondary);
    }

    /* Checked */
    .toggle-input:checked + .toggle-track {
      background: var(--primary-color);
    }

    .toggle-input:checked + .toggle-track .toggle-thumb {
      transform: translateX(var(--space-5)); /* 20px → var(--space-5): track(var(--space-8)) - thumb(var(--space-5)) - padding(2*var(--space-1)) ≈ var(--space-5) */
    }

    /* Focus */
    .toggle-input:focus-visible + .toggle-track {
      box-shadow: var(--input-shadow-focus);
    }

    .toggle-label {
      font-size: var(--text-sm);
      color: var(--text-color);
      line-height: 1.4;
    }

    /*
     * Dark mode se maneja automáticamente via tokens semánticos.
     * --border-color, --surface-background, --primary-color, --shadow-focus-primary
     * ya tienen valores apropiados para temas oscuros.
     */
  `]
})
export class ToggleComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() ariaLabel = 'Alternar opción';
  @Input() disabled = false;

  checked = false;
  onChange: (value: boolean) => void = () => { /* noop */ };
  onTouched: () => void = () => { /* noop */ };
  private readonly changeDetector = inject(ChangeDetectorRef);

  onToggleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.onChange(this.checked);
    this.onTouched();
  }

  writeValue(value: boolean): void {
    this.checked = value === true;
    this.changeDetector.markForCheck();
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.changeDetector.markForCheck();
  }
}
