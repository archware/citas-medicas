import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  KpiCardComponent,
  KpiFormat,
  KpiTone,
  KpiTrend,
} from '../../molecules/kpi-card/kpi-card.component';

export interface KpiMetric {
  /** Stable identity. New consumers should always provide it. */
  readonly id?: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly value: string | number;
  readonly displayValue?: string;
  readonly format?: KpiFormat;
  readonly currency?: string;
  readonly locale?: string;
  readonly fractionDigits?: number | null;
  readonly tone?: KpiTone;
  readonly trend?: KpiTrend;
  readonly trendValue?: string;
  readonly comparisonLabel?: string;
  readonly iconClass?: string;
  readonly series?: readonly number[];
}

@Component({
  selector: 'app-metrics-grid',
  standalone: true,
  imports: [KpiCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="metrics-grid"
      [class.metrics-grid--empty]="metrics.length === 0"
      [style.--min-col-width]="minCardWidth"
      [style.--metric-columns-desktop]="columnCount(4)"
      [style.--metric-columns-tablet]="columnCount(2)"
      [style.--metric-columns-mobile]="columnCount(1)"
      [attr.aria-label]="ariaLabel"
    >
      @for (metric of metrics; track metric.id ?? metric) {
        <app-kpi-card
          [title]="metric.title"
          [subtitle]="metric.subtitle ?? ''"
          [value]="metric.value"
          [displayValue]="metric.displayValue ?? ''"
          [format]="metric.format ?? 'number'"
          [currency]="metric.currency ?? 'PEN'"
          [locale]="metric.locale ?? 'es-PE'"
          [fractionDigits]="metric.fractionDigits ?? null"
          [tone]="metric.tone ?? 'neutral'"
          [trend]="metric.trend ?? null"
          [trendValue]="metric.trendValue ?? ''"
          [comparisonLabel]="metric.comparisonLabel ?? ''"
          [iconClass]="metric.iconClass ?? ''"
          [series]="metric.series ?? []"
        />
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-width: 0;
        max-width: 100%;
      }

      .metrics-grid {
        width: 100%;
        min-width: 0;
        max-width: 100%;
        display: grid;
        grid-template-columns:
          repeat(var(--metric-columns-desktop), minmax(min(100%, var(--min-col-width)), 1fr));
        gap: var(--space-3);
      }

      .metrics-grid > * {
        min-width: 0;
      }

      @media (max-width: 72rem) {
        .metrics-grid {
          grid-template-columns:
            repeat(var(--metric-columns-tablet), minmax(min(100%, var(--min-col-width)), 1fr));
        }
      }

      @media (max-width: 36rem) {
        .metrics-grid {
          grid-template-columns:
            repeat(var(--metric-columns-mobile), minmax(min(100%, var(--min-col-width)), 1fr));
        }
      }

      .metrics-grid--empty {
        grid-template-columns: none;
      }
    `,
  ],
})
export class MetricsGridComponent {
  @Input() metrics: readonly KpiMetric[] = [];
  @Input() minCardWidth = '13.75rem';
  @Input() ariaLabel = 'Resumen de indicadores';

  columnCount(capacity: number): number {
    return Math.min(this.metrics.length, capacity);
  }
}
