import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type ChoiceControlType = 'checkbox' | 'radio';

/** Checkbox o radio controlado con etiqueta y foco visibles. */
@Component({
  selector: 'app-choice-control, prest-choice-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.choice-control--checked]': 'checked()',
    '[class.choice-control--disabled]': 'disabled()',
  },
  templateUrl: './choice-control.html',
  styleUrl: './choice-control.scss',
})
export class ChoiceControl {
  private static nextId = 0;
  private readonly generatedId = `prest-choice-${++ChoiceControl.nextId}`;

  readonly controlId = input<string | null>(null);
  readonly type = input<ChoiceControlType>('checkbox');
  readonly label = input('');
  readonly ariaLabel = input<string | null>(null);
  readonly name = input<string | null>(null);
  readonly value = input('');
  readonly checked = input(false);
  readonly disabled = input(false);

  readonly changed = output<boolean>();

  protected readonly id = computed(() => this.controlId() ?? this.generatedId);
  protected readonly accessibleLabel = computed(() => this.ariaLabel() ?? (this.label() || null));

  protected handleChange(event: Event): void {
    this.changed.emit((event.target as HTMLInputElement).checked);
  }
}
