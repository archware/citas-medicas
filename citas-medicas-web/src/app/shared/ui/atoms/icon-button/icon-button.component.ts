import { Component, Input, Output, EventEmitter } from '@angular/core';

export type IconButtonVariant = 'default' | 'ghost' | 'avatar';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [],
  template: `
    <button 
      class="icon-btn"
      [class.icon-btn--ghost]="variant === 'ghost'"
      [class.icon-btn--avatar]="variant === 'avatar'"
      [attr.title]="tooltip"
      [attr.aria-label]="ariaLabel || tooltip"
      [disabled]="disabled"
      (click)="!disabled && clicked.emit($event)">
      <ng-content></ng-content>
      @if (badge && badge > 0) {
        <span class="icon-btn__badge">{{ badge > 9 ? '9+' : badge }}</span>
      }
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--control-height);
      height: var(--control-height);
      padding: 0;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      color: var(--text-color-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .icon-btn:hover { background: var(--surface-hover); color: var(--primary-color); transform: translateY(-2px) scale(1.05); box-shadow: var(--shadow-md); filter: brightness(1.1); }

    .icon-btn:active {
      transform: scale(0.95);
    }

    .icon-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: transparent;
      color: var(--text-color-secondary);
      transform: none;
    }

    /* Ghost variant - más sutil */
    .icon-btn--ghost {
      border: 1px solid transparent;
      box-shadow: none;
    }

    .icon-btn--ghost:hover {
      background: transparent;
      color: var(--primary-color);
      box-shadow: none;
      border: 1px solid transparent;
    }

    /* Avatar variant - circular con gradiente */
    .icon-btn--avatar {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
      border-radius: 50%;
      border: none;
      box-shadow: none;
      color: var(--text-color-on-primary);
    }

    .icon-btn--avatar:hover {
      background: linear-gradient(135deg, var(--primary-color-dark), var(--primary-color));
      transform: scale(1.05);
      box-shadow: var(--shadow-glow-primary);
    }

    /* Badge */
    .icon-btn__badge {
      position: absolute;
      top: var(--space-1);
      right: var(--space-1);
      min-width: var(--space-2);
      height: var(--space-2);
      padding: 0 4px;
      font-size: 0.625rem;
      font-weight: 600;
      color: var(--text-color-on-primary);
      background: var(--danger-color);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* SVG icons inside */
    ::ng-deep svg {
      width: 20px;
      height: 20px;
    }

    /* Standardized Icon Animations */
    ::ng-deep i.icon,
    ::ng-deep i.configuration-icon,
    ::ng-deep i.fa-solid,
    ::ng-deep i.fa-regular,
    ::ng-deep i.fa-brands {
      transition: color 200ms ease, transform 200ms ease;
    }

    .icon-btn:hover ::ng-deep i.icon,
    .icon-btn:hover ::ng-deep i.configuration-icon,
    .icon-btn:hover ::ng-deep i.fa-solid,
    .icon-btn:hover ::ng-deep i.fa-regular,
    .icon-btn:hover ::ng-deep i.fa-brands {
      transform: rotate(45deg) scale(1.15);
      color: var(--primary-color);
    }
  `]
})
export class IconButtonComponent {
  /** Button variant */
  @Input() variant: IconButtonVariant = 'default';

  /** Tooltip text */
  @Input() tooltip = '';

  /** Accessibility label */
  @Input() ariaLabel = '';

  /** Badge count (for notifications) */
  @Input() badge = 0;

  /** Disabled state */
  @Input() disabled = false;

  /** Click event */
  @Output() clicked = new EventEmitter<MouseEvent>();
}
