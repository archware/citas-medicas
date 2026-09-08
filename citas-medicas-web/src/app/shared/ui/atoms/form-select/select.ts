import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  readonly value: string | number;
  readonly label: string;
  readonly disabled?: boolean;
}

/** Selección portable para formularios reactivos y usos controlados. */
@Component({
  selector: 'app-select, prest-select, app-form-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select.html',
  styleUrl: './select.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select),
      multi: true,
    },
  ],
})
export class Select implements ControlValueAccessor {
  private static nextId = 0;
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly generatedId = `prest-select-${++Select.nextId}`;

  readonly options = input<readonly SelectOption[]>([]);
  readonly selected = input<string | number | null>(null);
  readonly label = input('');
  readonly ariaLabel = input<string | null>(null);
  readonly placeholder = input('Seleccione');
  readonly error = input<string | null>(null);
  readonly hint = input<string | null>(null);
  readonly disabled = input(false);
  readonly required = input(false);
  readonly controlId = input<string | null>(null);

  readonly selectionChange = output<string>();

  protected readonly formValue = signal('');
  protected readonly controlDisabled = signal(false);
  protected readonly id = computed(() => this.controlId() ?? this.generatedId);
  protected readonly effectiveDisabled = computed(() => this.disabled() || this.controlDisabled());
  protected readonly value = computed(() => {
    const selected = this.selected();
    return selected == null ? this.formValue() : String(selected);
  });
  protected readonly legacyOption = computed<SelectOption | null>(() => {
    const value = this.value();
    if (!value || this.options().some((option) => String(option.value) === value)) {
      return null;
    }
    return { value, label: value };
  });

  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected handleChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const selectedOption = this.options().find((option) => String(option.value) === value);
    this.formValue.set(value);
    this.onChange(selectedOption?.value ?? value);
    this.selectionChange.emit(value);
  }

  protected handleBlur(): void {
    this.onTouched();
  }

  writeValue(value: unknown): void {
    this.formValue.set(value == null ? '' : String(value));
    this.changeDetector.markForCheck();
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.controlDisabled.set(disabled);
    this.changeDetector.markForCheck();
  }
}
