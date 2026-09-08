import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  forwardRef,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonComponent } from '../../atoms/button/button.component';
import { NumberInputComponent } from '../../atoms/number-input/number-input.component';
import { AccordionComponent, AccordionItemComponent } from '../accordion/accordion.component';

export interface DenominationDefinition {
  readonly code: string;
  readonly value: number;
  readonly label: string;
  readonly description?: string;
}

export interface DenominationCount {
  readonly code: string;
  readonly quantity: number;
}

export type DenominationCounterState = 'empty' | 'suggested' | 'confirmed';

export interface DenominationCounterRow extends DenominationDefinition {
  readonly quantity: number;
  readonly subtotal: number;
}

/**
 * Contador monetario genérico.
 *
 * Las denominaciones pertenecen al consumidor. El organismo únicamente
 * normaliza cantidades enteras, calcula subtotales y compone el flujo dentro
 * del Accordion canónico.
 */
@Component({
  selector: 'app-denomination-counter, prest-denomination-counter',
  standalone: true,
  imports: [
    AccordionComponent,
    AccordionItemComponent,
    ButtonComponent,
    CommonModule,
    FormsModule,
    NumberInputComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DenominationCounter),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-accordion>
      <app-accordion-item
        [title]="title"
        [description]="accordionDescription()"
        [open]="open"
        [disabled]="disabled"
        (openChange)="setExpanded($event)"
      >
        @if (optional && !expanded()) {
          <span aria-hidden="true"></span>
        } @else if (rows().length === 0) {
          <p class="denomination-counter__empty">{{ emptyMessage }}</p>
        } @else {
          <div class="denomination-counter__status" [attr.data-state]="state" aria-live="polite">
            <span>{{ stateLabel() }}</span>
            @if (state === 'suggested' && total() > 0 && !disabled) {
              <app-button
                type="button"
                variant="outline"
                size="sm"
                iconClass="check"
                (buttonClick)="confirmCurrentValue()"
              >
                {{ suggestionActionLabel }}
              </app-button>
            }
          </div>
          <div class="denomination-counter__head" aria-hidden="true">
            <span>Denominación</span>
            <span>Cantidad</span>
            <span>Subtotal</span>
          </div>
          <div class="denomination-counter__rows">
            @for (row of rows(); track row.code) {
              <div class="denomination-counter__row">
                <div class="denomination-counter__denomination">
                  <strong>{{ row.label }}</strong>
                  @if (row.description) {
                    <span>{{ row.description }}</span>
                  }
                </div>
                <app-number-input
                  [inputId]="id + '-' + row.code"
                  [label]="'Cantidad de ' + row.label"
                  [min]="0"
                  [max]="maxQuantity"
                  [step]="1"
                  [disabled]="disabled"
                  [ngModel]="row.quantity"
                  [ngModelOptions]="{ standalone: true }"
                  (ngModelChange)="setQuantity(row.code, $event)"
                />
                <output
                  class="denomination-counter__subtotal"
                  [attr.aria-label]="'Subtotal de ' + row.label"
                >
                  {{ formatMoney(row.subtotal) }}
                </output>
              </div>
            }
          </div>
          <div class="denomination-counter__total" aria-live="polite">
            <span>{{ totalLabel }}</span>
            <strong>{{ formatMoney(total()) }}</strong>
          </div>
          @if (calculationNotice) {
            <p class="denomination-counter__notice">{{ calculationNotice }}</p>
          }
        }
      </app-accordion-item>
    </app-accordion>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }

      .denomination-counter__status {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-3);
        padding-block-end: var(--space-3);
        color: var(--text-color-muted);
        font-size: var(--text-sm);
      }

      .denomination-counter__status[data-state='suggested'] {
        color: var(--warning-color);
      }

      .denomination-counter__status[data-state='confirmed'] {
        color: var(--success-color);
      }

      .denomination-counter__head,
      .denomination-counter__row {
        display: grid;
        grid-template-columns: minmax(7rem, 1fr) minmax(10rem, 1fr) minmax(7rem, auto);
        align-items: center;
        gap: var(--space-4);
      }

      .denomination-counter__head {
        padding-block-end: var(--space-2);
        border-bottom: thin solid var(--border-color);
        color: var(--text-color-muted);
        font-size: var(--text-xs);
        font-weight: 600;
      }

      .denomination-counter__head span:last-child {
        text-align: end;
      }

      .denomination-counter__rows {
        display: grid;
      }

      .denomination-counter__row {
        padding-block: var(--space-3);
        border-bottom: thin solid var(--border-color);
      }

      .denomination-counter__denomination {
        min-width: 0;
        display: grid;
        gap: var(--space-1);
        color: var(--text-color);
      }

      .denomination-counter__denomination span {
        color: var(--text-color-muted);
        font-size: var(--text-xs);
      }

      .denomination-counter__row app-number-input ::ng-deep .number-input__label {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      .denomination-counter__subtotal {
        color: var(--text-color);
        font-variant-numeric: tabular-nums;
        font-weight: 600;
        text-align: end;
      }

      .denomination-counter__total {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
        padding-block-start: var(--space-4);
        color: var(--text-color);
        font-size: var(--text-md);
      }

      .denomination-counter__total strong {
        color: var(--primary-color);
        font-variant-numeric: tabular-nums;
      }

      .denomination-counter__empty {
        margin: 0;
        color: var(--text-color-muted);
      }

      .denomination-counter__notice {
        margin: var(--space-2) 0 0;
        color: var(--text-color-muted);
        font-size: var(--text-xs);
      }

      @media (max-width: 40rem) {
        .denomination-counter__head {
          display: none;
        }

        .denomination-counter__row {
          grid-template-columns: minmax(0, 1fr) minmax(8rem, 1fr);
        }

        .denomination-counter__subtotal {
          grid-column: 1 / -1;
          text-align: start;
        }
      }
    `,
  ],
})
export class DenominationCounter implements ControlValueAccessor {
  private static nextId = 0;

  @Input() id = `denomination-counter-${++DenominationCounter.nextId}`;
  @Input() title = 'Desglose de efectivo';
  @Input() description = 'Registre la cantidad por denominación.';
  @Input() totalLabel = 'Total contado';
  @Input() calculationNotice =
    'Total referencial. El backend conserva la autoridad sobre el monto definitivo.';
  @Input() emptyMessage = 'No hay denominaciones disponibles.';
  @Input() optional = false;
  @Input() state: DenominationCounterState = 'empty';
  @Input() suggestionActionLabel = 'Confirmar desglose sugerido';
  @Input() set open(value: boolean) {
    this.openState = value;
    this.expanded.set(value);
  }
  get open(): boolean {
    return this.openState;
  }
  @Input() set maxQuantity(value: number) {
    const normalized = this.normalizeMaximumQuantity(value);
    if (normalized === this.maximumQuantity) {
      return;
    }

    this.maximumQuantity = normalized;
    if (this.renormalizeQuantities()) {
      this.emitValue();
    }
  }
  get maxQuantity(): number {
    return this.maximumQuantity;
  }
  @Input() locale = 'es-PE';
  @Input() currency = 'PEN';
  @Input() disabled = false;
  @Input() set value(value: readonly DenominationCount[] | null | undefined) {
    this.writeValue(value);
  }

  @Input() set denominations(value: readonly DenominationDefinition[] | null | undefined) {
    const definitions = this.normalizeDefinitions(value ?? []);
    this.definitions.set(definitions);
    const wasAwaitingDefinitions = this.awaitingDefinitionsForExternalValue;
    if (wasAwaitingDefinitions && definitions.length === 0) {
      return;
    }
    this.awaitingDefinitionsForExternalValue = false;
    if (this.pruneUnknownCounts() && !wasAwaitingDefinitions) {
      this.emitValue();
    }
  }

  @Output() readonly valueChange = new EventEmitter<readonly DenominationCount[]>();
  @Output() readonly totalChange = new EventEmitter<number>();
  @Output() readonly openChange = new EventEmitter<boolean>();

  private readonly definitions = signal<readonly DenominationDefinition[]>([]);
  private readonly quantities = signal<ReadonlyMap<string, number>>(new Map());
  private maximumQuantity = 9999;
  private awaitingDefinitionsForExternalValue = false;
  private openState = false;
  readonly expanded = signal(false);

  readonly rows = computed<readonly DenominationCounterRow[]>(() =>
    this.definitions().map((definition) => {
      const quantity = this.quantities().get(definition.code) ?? 0;
      return {
        ...definition,
        quantity,
        subtotal: this.roundMoney(definition.value * quantity),
      };
    }),
  );

  readonly total = computed(() =>
    this.roundMoney(this.rows().reduce((sum, row) => sum + row.subtotal, 0)),
  );

  accordionDescription(): string {
    const formattedTotal = this.formatMoney(this.total());
    const description =
      this.description.trim().length > 0
        ? `${this.description} Total: ${formattedTotal}.`
        : `Total: ${formattedTotal}.`;
    const state = this.stateLabel();
    return this.optional
      ? `Opcional para auditoría. ${state}. ${description}`
      : `${state}. ${description}`;
  }

  stateLabel(): string {
    switch (this.state) {
      case 'suggested':
        return 'Sugerido, pendiente de confirmar';
      case 'confirmed':
        return 'Desglose confirmado';
      default:
        return 'Sin desglose';
    }
  }

  private onChange: (value: readonly DenominationCount[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: readonly DenominationCount[] | null | undefined): void {
    const next = new Map<string, number>();
    for (const item of value ?? []) {
      const code = item.code?.trim();
      if (!code) {
        continue;
      }
      next.set(code, this.normalizeQuantity(item.quantity));
    }
    this.quantities.set(next);
    this.awaitingDefinitionsForExternalValue = this.definitions().length === 0 && next.size > 0;
    if (!this.awaitingDefinitionsForExternalValue) {
      this.pruneUnknownCounts();
    }
  }

  registerOnChange(fn: (value: readonly DenominationCount[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  setExpanded(open: boolean): void {
    if (this.openState === open && this.expanded() === open) {
      return;
    }
    this.openState = open;
    this.expanded.set(open);
    this.openChange.emit(open);
  }

  setQuantity(code: string, value: number): void {
    if (this.disabled) {
      return;
    }

    const next = new Map(this.quantities());
    next.set(code, this.normalizeQuantity(value));
    this.quantities.set(next);
    this.onTouched();
    this.emitValue();
  }

  confirmCurrentValue(): void {
    if (this.disabled || this.state !== 'suggested' || this.total() <= 0) {
      return;
    }

    this.onTouched();
    this.emitValue();
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  private emitValue(): void {
    const value = this.rows()
      .filter((row) => row.quantity > 0)
      .map(({ code, quantity }) => ({ code, quantity }));
    this.onChange(value);
    this.valueChange.emit(value);
    this.totalChange.emit(this.total());
  }

  private normalizeDefinitions(
    definitions: readonly DenominationDefinition[],
  ): readonly DenominationDefinition[] {
    const seen = new Set<string>();
    const normalized: DenominationDefinition[] = [];

    for (const definition of definitions) {
      const code = definition.code?.trim();
      if (!code || seen.has(code) || !Number.isFinite(definition.value) || definition.value <= 0) {
        continue;
      }

      seen.add(code);
      normalized.push({
        ...definition,
        code,
        label: definition.label?.trim() || code,
        value: this.roundMoney(definition.value),
      });
    }

    return normalized;
  }

  private pruneUnknownCounts(): boolean {
    const knownCodes = new Set(this.definitions().map((definition) => definition.code));
    const next = new Map([...this.quantities()].filter(([code]) => knownCodes.has(code)));
    if (next.size === this.quantities().size) {
      return false;
    }
    this.quantities.set(next);
    return true;
  }

  private renormalizeQuantities(): boolean {
    const next = new Map<string, number>();
    let changed = false;
    for (const [code, quantity] of this.quantities()) {
      const normalized = this.normalizeQuantity(quantity);
      next.set(code, normalized);
      changed ||= normalized !== quantity;
    }
    if (changed) {
      this.quantities.set(next);
    }
    return changed;
  }

  private normalizeQuantity(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.min(Math.max(Math.trunc(value), 0), this.maxQuantity);
  }

  private normalizeMaximumQuantity(value: number): number {
    return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 9999;
  }

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
