import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * NumberInputComponent — Input numérico con botones de incremento/decremento.
 * Compatible con `ngModel` y `FormControl`.
 *
 * @example
 * ```html
 * <app-number-input [(ngModel)]="quantity" [min]="1" [max]="99" label="Cantidad"></app-number-input>
 * ```
 */
@Component({
  selector: 'app-number-input',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="number-input-wrapper" [class.number-input--disabled]="disabled">
      @if (label) {
        <label class="number-input__label" [attr.for]="inputId">{{ label }}</label>
      }
      <div class="number-input__control">
        <button
          type="button"
          class="number-input__btn"
          aria-label="Decrementar"
          [disabled]="disabled || value() <= min"
          (click)="decrement()"
        >
          <i class="fa-solid fa-minus" aria-hidden="true"></i>
        </button>

        <input
          [id]="inputId"
          type="number"
          class="number-input__field"
          [min]="min"
          [max]="max"
          [step]="step"
          [disabled]="disabled"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onTouched()"
          [attr.aria-label]="label ? null : 'Número'"
          [attr.aria-describedby]="describedBy"
          [attr.aria-invalid]="error ? 'true' : null"
        />

        <button
          type="button"
          class="number-input__btn"
          aria-label="Incrementar"
          [disabled]="disabled || value() >= max"
          (click)="increment()"
        >
          <i class="fa-solid fa-plus" aria-hidden="true"></i>
        </button>
      </div>
      @if (hint) {
        <span class="number-input__hint" [id]="inputId + '-hint'">{{ hint }}</span>
      }
      @if (error) {
        <span class="number-input__error" [id]="inputId + '-error'" role="alert">{{ error }}</span>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .number-input__label {
      display: block;
      margin-bottom: var(--space-1);
      font-size: var(--text-sm);
      font-weight: var(--font-medium, 500);
      color: var(--text-color-secondary);
    }

    .number-input__control {
      display: flex;        /* Cambiado de inline-flex a flex para ocupar ancho del contenedor */
      align-items: stretch;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--surface-background);
      width: 100%;
    }

    .number-input__btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--space-7);
      flex-shrink: 0;
      background: var(--surface-section);
      border: none;
      cursor: pointer;
      color: var(--text-color-secondary);
      transition: background 150ms ease, color 150ms ease;
      font-size: var(--text-sm);
    }
    .number-input__btn:hover:not(:disabled) {
      background: var(--surface-hover, var(--primary-color));
      color: var(--text-color-on-primary);
    }
    .number-input__btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .number-input__field {
      flex: 1;
      min-width: var(--space-8);
      border: none;
      border-left: 1px solid var(--border-color);
      border-right: 1px solid var(--border-color);
      background: transparent;
      text-align: center;
      font-size: var(--text-sm);
      color: var(--text-color);
      padding: var(--space-2) var(--space-1);
      outline: none;
      -moz-appearance: textfield;
    }
    .number-input__field::-webkit-inner-spin-button,
    .number-input__field::-webkit-outer-spin-button { -webkit-appearance: none; }

    .number-input--disabled .number-input__control {
      opacity: 0.6;
      pointer-events: none;
    }

    .number-input__hint {
      display: block;
      margin-top: var(--space-1);
      font-size: var(--text-xs);
      color: var(--text-color-muted);
    }

    .number-input__error {
      display: block;
      margin-top: var(--space-1);
      font-size: var(--text-xs);
      color: var(--danger-color);
    }
  `],
})
export class NumberInputComponent implements ControlValueAccessor {
  private static nextId = 0;

  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() min = 0;
  @Input() max = 9999;
  @Input() step = 1;
  @Input() disabled = false;
  @Input() inputId = `number-input-${++NumberInputComponent.nextId}`;

  @Output() valueChange = new EventEmitter<number>();

  protected value = signal<number>(0);

  private onChange: (value: number) => void = () => {};
  protected onTouched: () => void = () => {};

  protected get describedBy(): string | null {
    const ids = [this.hint ? `${this.inputId}-hint` : '', this.error ? `${this.inputId}-error` : ''].filter(Boolean);
    return ids.length > 0 ? ids.join(' ') : null;
  }

  writeValue(value: number): void {
    this.value.set(value ?? 0);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  increment(): void {
    const next = Math.min(this.value() + this.step, this.max);
    this.setValue(next);
    this.onTouched();
  }

  decrement(): void {
    const next = Math.max(this.value() - this.step, this.min);
    this.setValue(next);
    this.onTouched();
  }

  onInput(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) {
      this.setValue(Math.min(Math.max(val, this.min), this.max));
    }
  }

  private setValue(val: number): void {
    this.value.set(val);
    this.onChange(val);
    this.valueChange.emit(val);
  }
}
