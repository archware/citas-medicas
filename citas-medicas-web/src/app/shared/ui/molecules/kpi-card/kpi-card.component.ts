import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type KpiTrend = 'up' | 'down' | 'neutral' | null;
export type KpiFormat = 'number' | 'currency' | 'percent' | 'compact' | 'duration';
export type KpiTone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="kpi-card"
      [class]="'kpi-card kpi-card--' + tone"
      [attr.aria-label]="accessibleLabel"
    >
      <header class="kpi-card__header">
        <div class="kpi-card__heading">
          <p class="kpi-card__title">{{ title }}</p>
          @if (subtitle) {
            <p class="kpi-card__subtitle">{{ subtitle }}</p>
          }
        </div>
        @if (iconClass) {
          <span class="kpi-card__icon" aria-hidden="true">
            <i [class]="iconClass"></i>
          </span>
        }
      </header>

      <div class="kpi-card__content">
        <p class="kpi-card__value">{{ formattedValue }}</p>

        @if (trend || comparisonLabel) {
          <div class="kpi-card__meta">
            @if (trend) {
              <span class="kpi-card__trend" [class]="'kpi-card__trend--' + trend">
                @switch (trend) {
                  @case ('up') {
                    <i class="fa-solid fa-arrow-trend-up" aria-hidden="true"></i>
                  }
                  @case ('down') {
                    <i class="fa-solid fa-arrow-trend-down" aria-hidden="true"></i>
                  }
                  @case ('neutral') {
                    <i class="fa-solid fa-minus" aria-hidden="true"></i>
                  }
                }
                {{ trendLabel }}
              </span>
            }
            @if (comparisonLabel) {
              <span class="kpi-card__comparison">{{ comparisonLabel }}</span>
            }
          </div>
        }
      </div>

      @if (sparklinePoints; as points) {
        <footer class="kpi-card__chart" aria-hidden="true">
          <svg viewBox="0 0 120 32" preserveAspectRatio="none" focusable="false">
            <polyline
              [attr.points]="points"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              vector-effect="non-scaling-stroke"
            ></polyline>
          </svg>
        </footer>
      }
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-width: 0;
        max-width: 100%;
      }

      .kpi-card {
        --kpi-accent: var(--text-color-secondary);
        --kpi-accent-background: var(--surface-section);
        width: 100%;
        min-width: 0;
        min-height: 6.5rem;
        display: grid;
        box-sizing: border-box;
        gap: var(--space-2);
        padding: var(--space-3) var(--space-4);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        background: var(--surface-background);
        box-shadow: var(--shadow-sm);
      }

      .kpi-card--brand {
        --kpi-accent: var(--primary-color);
        --kpi-accent-background: var(--primary-color-lighter);
      }

      .kpi-card--info {
        --kpi-accent: var(--info-color-text);
        --kpi-accent-background: var(--info-color-lighter);
      }

      .kpi-card--success {
        --kpi-accent: var(--success-color-text);
        --kpi-accent-background: var(--success-color-lighter);
      }

      .kpi-card--warning {
        --kpi-accent: var(--warning-color-text);
        --kpi-accent-background: var(--warning-color-lighter);
      }

      .kpi-card--danger {
        --kpi-accent: var(--danger-color-text);
        --kpi-accent-background: var(--danger-color-lighter);
      }

      .kpi-card__header {
        min-width: 0;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--space-3);
      }

      .kpi-card__heading,
      .kpi-card__content {
        min-width: 0;
      }

      .kpi-card__heading {
        flex: 1;
      }

      .kpi-card__title {
        margin: 0;
        color: var(--text-color-secondary);
        font-size: var(--text-xs);
        font-weight: 700;
        letter-spacing: 0.04em;
        overflow-wrap: anywhere;
        text-transform: uppercase;
      }

      .kpi-card__subtitle {
        margin: var(--space-1) 0 0;
        color: var(--text-color-muted);
        font-size: var(--text-xs);
        line-height: 1.4;
        overflow-wrap: anywhere;
      }

      .kpi-card__icon {
        width: 2rem;
        height: 2rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        border: 1px solid color-mix(in srgb, var(--kpi-accent) 28%, transparent);
        border-radius: var(--radius-md);
        background: var(--kpi-accent-background);
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--surface-background) 42%, transparent);
        color: var(--kpi-accent);
      }

      .kpi-card__value {
        margin: 0;
        color: var(--text-color);
        font-size: 1.35rem;
        font-variant-numeric: tabular-nums;
        font-weight: 700;
        letter-spacing: -0.02em;
        line-height: 1.2;
        overflow-wrap: anywhere;
      }

      .kpi-card__meta {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--space-2);
        margin-top: var(--space-2);
      }

      .kpi-card__trend {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-1) var(--space-2);
        border: 1px solid transparent;
        border-radius: var(--radius-full);
        font-size: var(--text-xs);
        font-weight: 700;
      }

      .kpi-card__comparison {
        max-width: 100%;
        color: var(--text-color-muted);
        font-size: var(--text-xs);
        overflow-wrap: anywhere;
      }

      .kpi-card__trend--up {
        border-color: var(--success-color-light);
        background: var(--success-color-lighter);
        color: var(--success-color-text, var(--success-color-dark));
      }

      .kpi-card__trend--down {
        border-color: var(--danger-color-light);
        background: var(--danger-color-lighter);
        color: var(--danger-color-text, var(--danger-color-dark));
      }

      .kpi-card__trend--neutral {
        border-color: var(--border-color);
        background: var(--surface-section);
        color: var(--text-color-secondary);
      }

      .kpi-card__chart {
        height: 2rem;
        display: flex;
        align-items: flex-end;
        color: var(--kpi-accent);
        opacity: 0.85;
      }

      .kpi-card__chart svg {
        width: 100%;
        height: 100%;
      }

      @media (max-width: 40rem) {
        .kpi-card {
          min-height: 5.5rem;
          padding: var(--space-3);
        }
      }
    `,
  ],
})
export class KpiCardComponent {
  /** Visible KPI label. */
  @Input() title = 'Métrica';

  /** Optional context shown under the label. */
  @Input() subtitle = '';

  /** Raw value used only when displayValue is not supplied. */
  @Input() value: string | number = 0;

  /** Preformatted value. Prefer this for authoritative financial presentation. */
  @Input() displayValue = '';

  @Input() format: KpiFormat = 'number';
  @Input() currency = 'PEN';
  @Input() locale = 'es-PE';

  /** Decimal places for number/currency/percent. Null keeps each format default. */
  @Input() fractionDigits: number | null = null;

  /** Semantic emphasis. Neutral avoids turning every metric into a brand action. */
  @Input() tone: KpiTone = 'neutral';

  /** Null intentionally means that no comparison trend is available. */
  @Input() trend: KpiTrend = null;
  @Input() trendValue = '';
  @Input() iconClass = '';
  @Input() series: readonly number[] = [];
  @Input() comparisonLabel = '';

  get formattedValue(): string {
    const authoritativeDisplay = this.displayValue.trim();
    if (authoritativeDisplay) {
      return authoritativeDisplay;
    }

    const number = Number(this.value);
    if (!Number.isFinite(number)) {
      return String(this.value);
    }

    if (this.format === 'currency') {
      const digits = this.normalizedFractionDigits(2);
      return new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: this.currency,
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(number);
    }

    if (this.format === 'percent') {
      return `${number.toFixed(this.normalizedFractionDigits(1))}%`;
    }

    if (this.format === 'compact') {
      return new Intl.NumberFormat(this.locale, {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: this.normalizedFractionDigits(1),
      }).format(number);
    }

    if (this.format === 'duration') {
      const totalMinutes = Math.max(0, Math.round(number));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return hours > 0 ? `${hours}h ${minutes.toString().padStart(2, '0')}m` : `${minutes}m`;
    }

    const digits = this.fractionDigits;
    return new Intl.NumberFormat(
      this.locale,
      digits === null
        ? undefined
        : {
            minimumFractionDigits: this.normalizedFractionDigits(0),
            maximumFractionDigits: this.normalizedFractionDigits(0),
          },
    ).format(number);
  }

  get trendLabel(): string {
    if (!this.trend) {
      return '';
    }
    if (this.trendValue) {
      return this.trendValue;
    }
    return this.trend === 'up' ? 'Sube' : this.trend === 'down' ? 'Baja' : 'Estable';
  }

  get sparklinePoints(): string {
    const finiteSeries = this.series.filter((point) => Number.isFinite(point));
    if (finiteSeries.length < 2) {
      return '';
    }

    const min = Math.min(...finiteSeries);
    const max = Math.max(...finiteSeries);
    const range = max - min || 1;

    return finiteSeries
      .map((point, index) => {
        const x = (index / (finiteSeries.length - 1)) * 120;
        const y = 30 - ((point - min) / range) * 24;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }

  get accessibleLabel(): string {
    return [
      `${this.title}: ${this.formattedValue}`,
      this.subtitle,
      this.trend ? this.trendLabel : '',
      this.comparisonLabel,
    ]
      .filter(Boolean)
      .join('. ');
  }

  private normalizedFractionDigits(fallback: number): number {
    if (this.fractionDigits === null || !Number.isFinite(this.fractionDigits)) {
      return fallback;
    }
    return Math.min(6, Math.max(0, Math.trunc(this.fractionDigits)));
  }
}
