import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

export type VersionVariant = 'pill' | 'badge' | 'text' | 'compact';

/**
 * Reusable version indicator component for footers, topbars, and application info panels.
 * Guaranteed 100% visible across all themes with solid fallback colors.
 */
@Component({
  selector: 'app-version',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="atomic-version" [class]="'atomic-version--' + (variant || 'badge')">
      @if (variant === 'pill' || variant === 'badge' || !variant) {
        <span class="atomic-version__dot" [class]="'atomic-version__dot--' + (environment || 'beta').toLowerCase()"></span>
      }
      
      @if (appName) {
        <span class="atomic-version__name">{{ appName }}</span>
      }
      
      <span class="atomic-version__number">{{ version || 'v1.1.0' }}</span>

      @if (environment) {
        <span class="atomic-version__env" [class]="'atomic-version__env--' + (environment || 'beta').toLowerCase()">
          {{ environment }}
        </span>
      }

      @if (showBuildDate && buildDate) {
        <span class="atomic-version__date">({{ buildDate }})</span>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block !important;
      vertical-align: middle !important;
    }

    .atomic-version {
      display: inline-flex !important;
      align-items: center !important;
      gap: 6px !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      font-size: 0.75rem !important;
      line-height: 1 !important;
      color: #94a3b8 !important;
      user-select: none !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    /* === PILL VARIANT === */
    .atomic-version--pill {
      padding: 3px 10px !important;
      background: rgba(30, 41, 59, 0.7) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      border-radius: 9999px !important;
    }

    /* === BADGE VARIANT === */
    .atomic-version--badge {
      padding: 3px 8px !important;
      background: rgba(15, 23, 42, 0.75) !important;
      border: 1px solid rgba(255, 255, 255, 0.18) !important;
      border-radius: 4px !important;
    }

    /* === TEXT VARIANT === */
    .atomic-version--text {
      background: transparent !important;
      border: none !important;
      padding: 0 !important;
    }

    /* === COMPACT VARIANT === */
    .atomic-version--compact {
      gap: 4px !important;
      font-size: 0.7rem !important;
    }

    /* Elements */
    .atomic-version__dot {
      width: 7px !important;
      height: 7px !important;
      border-radius: 50% !important;
      background-color: #10b981 !important;
      box-shadow: 0 0 6px #10b981 !important;
      display: inline-block !important;
    }

    .atomic-version__dot--dev {
      background-color: #f59e0b !important;
      box-shadow: 0 0 6px #f59e0b !important;
    }

    .atomic-version__dot--beta {
      background-color: #3b82f6 !important;
      box-shadow: 0 0 6px #3b82f6 !important;
    }

    .atomic-version__dot--qa, .atomic-version__dot--staging {
      background-color: #8b5cf6 !important;
      box-shadow: 0 0 6px #8b5cf6 !important;
    }

    .atomic-version__name {
      font-weight: 500 !important;
      color: #94a3b8 !important;
    }

    .atomic-version__number {
      font-weight: 700 !important;
      letter-spacing: 0.03em !important;
      color: #ffffff !important;
    }

    .atomic-version__env {
      padding: 2px 6px !important;
      border-radius: 4px !important;
      font-size: 0.65rem !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      background: #3b82f6 !important;
      color: #ffffff !important;
    }

    .atomic-version__env--prod {
      background: #10b981 !important;
      color: #ffffff !important;
    }

    .atomic-version__env--dev {
      background: #f59e0b !important;
      color: #000000 !important;
    }

    .atomic-version__env--beta {
      background: #3b82f6 !important;
      color: #ffffff !important;
    }

    .atomic-version__env--qa, .atomic-version__env--staging {
      background: #8b5cf6 !important;
      color: #ffffff !important;
    }

    .atomic-version__date {
      color: #64748b !important;
      font-size: 0.65rem !important;
    }
  `]
})
export class VersionComponent {
  @Input() version = 'v1.1.0';
  @Input() appName = '';
  @Input() environment = 'BETA';
  @Input() variant: VersionVariant = 'badge';
  @Input() showBuildDate = false;
  @Input() buildDate = '';
}
