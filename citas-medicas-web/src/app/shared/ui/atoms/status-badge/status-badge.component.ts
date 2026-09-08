import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type StatusBadgeStatus =
  'active' | 'inactive' | 'degraded' | 'unconfigured' | 'info' | 'success' | 'warning' | 'danger';
export type StatusBadgeChannel = 'web' | 'telegram' | 'sms';
export type StatusBadgeSize = 'sm' | 'md';

const STATUS_LABELS: Readonly<Record<StatusBadgeStatus, string>> = {
  active: 'Activo',
  inactive: 'Inactivo',
  degraded: 'Con incidencias',
  unconfigured: 'Sin configurar',
  info: 'Informativo',
  success: 'Correcto',
  warning: 'Advertencia',
  danger: 'Crítico',
};

const CHANNELS: Readonly<
  Record<StatusBadgeChannel, { readonly label: string; readonly iconClass: string }>
> = {
  web: { label: 'WEB', iconClass: 'fa-solid fa-globe' },
  telegram: { label: 'TELEGRAM', iconClass: 'fa-brands fa-telegram' },
  sms: { label: 'SMS', iconClass: 'fa-solid fa-comment-sms' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="status-badge"
      [class]="'status-badge--' + status + ' status-badge--' + size"
      [attr.aria-label]="computedAriaLabel"
      [attr.role]="announce ? 'status' : null"
      [attr.aria-live]="announce ? 'polite' : null"
    >
      @if (channelDefinition; as channelInfo) {
        <span class="status-badge__channel">
          <i [class]="channelInfo.iconClass" aria-hidden="true"></i>
          <span>{{ channelInfo.label }}</span>
        </span>
        <span class="status-badge__separator" aria-hidden="true"></span>
      }
      <span class="status-badge__dot" aria-hidden="true"></span>
      <span class="status-badge__label">{{ statusLabel }}</span>
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        min-width: 0;
        max-width: 100%;
      }

      .status-badge {
        min-width: 0;
        max-width: 100%;
        display: inline-flex;
        align-items: center;
        gap: var(--space-1);
        box-sizing: border-box;
        border: 1px solid transparent;
        border-radius: var(--radius-full);
        font-weight: 700;
        line-height: 1.2;
      }

      .status-badge--sm {
        min-height: 1.5rem;
        padding: var(--space-1) var(--space-2);
        font-size: var(--text-2xs, 0.6875rem);
      }

      .status-badge--md {
        min-height: 1.75rem;
        padding: var(--space-1) var(--space-3);
        font-size: var(--text-xs);
      }

      .status-badge__channel,
      .status-badge__label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .status-badge__channel {
        display: inline-flex;
        align-items: center;
        gap: var(--space-1);
        letter-spacing: 0.03em;
      }

      .status-badge__separator {
        width: 1px;
        height: 0.875rem;
        flex: 0 0 auto;
        background: currentColor;
        opacity: 0.35;
      }

      .status-badge__dot {
        width: 0.5rem;
        height: 0.5rem;
        flex: 0 0 auto;
        border-radius: var(--radius-full);
        background: currentColor;
      }

      .status-badge--active {
        border-color: var(--success-color-light);
        background: var(--success-color-lighter);
        color: var(--success-color-text, var(--success-color-dark));
      }

      .status-badge--inactive {
        border-color: var(--border-color);
        background: var(--surface-section);
        color: var(--text-color-secondary);
      }

      .status-badge--degraded {
        border-color: var(--warning-color-light);
        background: var(--warning-color-lighter);
        color: var(--warning-color-text, var(--warning-color-dark));
      }

      .status-badge--unconfigured {
        border-color: var(--info-color-light);
        background: var(--info-color-lighter);
        color: var(--info-color-text, var(--info-color-dark));
      }

      .status-badge--info {
        border-color: var(--info-color-light);
        background: var(--info-color-lighter);
        color: var(--info-color-text, var(--info-color-dark));
      }

      .status-badge--success {
        border-color: var(--success-color-light);
        background: var(--success-color-lighter);
        color: var(--success-color-text, var(--success-color-dark));
      }

      .status-badge--warning {
        border-color: var(--warning-color-light);
        background: var(--warning-color-lighter);
        color: var(--warning-color-text, var(--warning-color-dark));
      }

      .status-badge--danger {
        border-color: var(--danger-color-light);
        background: var(--danger-color-lighter);
        color: var(--danger-color-text, var(--danger-color-dark));
      }
    `,
  ],
})
export class StatusBadgeComponent {
  @Input() status: StatusBadgeStatus = 'unconfigured';
  @Input() channel: StatusBadgeChannel | null = null;
  @Input() size: StatusBadgeSize = 'md';
  @Input() label = '';
  @Input() ariaLabel = '';
  @Input() announce = false;

  get statusLabel(): string {
    return this.label.trim() || STATUS_LABELS[this.status];
  }

  get channelDefinition(): (typeof CHANNELS)[StatusBadgeChannel] | null {
    return this.channel ? CHANNELS[this.channel] : null;
  }

  get computedAriaLabel(): string {
    if (this.ariaLabel.trim()) {
      return this.ariaLabel.trim();
    }
    return this.channelDefinition
      ? `${this.channelDefinition.label}: ${this.statusLabel}`
      : this.statusLabel;
  }
}
