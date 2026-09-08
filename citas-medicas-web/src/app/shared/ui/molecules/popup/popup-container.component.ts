import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { PopupService, PopupItem } from '../../services/popup.service';

/**
 * Contenedor de popups global.
 * Debe colocarse en el nivel raíz del app (app.component o app.html).
 * Lee los popups del PopupService y los renderiza como modales.
 * 
 * @example
 * ```html
 * <!-- En app.html o app.component -->
 * <app-popup-container></app-popup-container>
 * ```
 */
@Component({
  selector: 'app-popup-container',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (popup of popupService.popups(); track popup.id) {
      <div 
        class="popup-overlay" 
        [class.popup-closing]="popup.closing"
        (click)="onBackdropClick(popup)"
        (keydown.escape)="onEscape(popup)"
        (keydown.enter)="onEnter(popup)"
        tabindex="0"
        role="dialog"
        aria-modal="true"
      >
        <div 
          class="popup" 
          [class]="'popup-' + popup.size + ' popup-type-' + popup.type"
          (click)="$event.stopPropagation()"
          (keydown)="$event.stopPropagation()"
          tabindex="-1"
        >
          <!-- Header -->
          <div class="popup-header">
            @if (popup.icon) {
              <span class="popup-icon" [class]="'popup-icon-' + popup.type">
                <i [class]="popup.icon"></i>
              </span>
            }
            <h3 class="popup-title">{{ popup.title }}</h3>
            @if (popup.closable) {
              <button class="popup-close" (click)="popupService.close(popup.id)" type="button" aria-label="Cerrar">
                <i class="fa-solid fa-xmark"></i>
              </button>
            }
          </div>

          <!-- Body -->
          <div class="popup-body">
            @if (popup.message) {
              <p class="popup-message">{{ popup.message }}</p>
            }
            @if (popup.htmlContent) {
              <div [innerHTML]="popup.htmlContent"></div>
            }
          </div>

          <!-- Footer -->
          @if (popup.buttons && popup.buttons.length > 0) {
            <div class="popup-footer">
              @for (button of popup.buttons; track button.label) {
                <button 
                  type="button"
                  class="popup-btn"
                  [class]="'popup-btn-' + (button.variant || 'primary')"
                  (click)="button.action()"
                >
                  {{ button.label }}
                </button>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .popup-overlay {
      position: fixed;
      inset: 0;
      background: var(--overlay-backdrop);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: popupFadeIn 150ms ease;
    }

    .popup-overlay.popup-closing {
      animation: popupFadeOut 200ms ease forwards;
    }

    @keyframes popupFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes popupFadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    .popup {
      background: var(--surface-background);
      border-radius: var(--radius-lg);
      width: 90%;
      box-shadow: var(--shadow-xl);
      animation: popupSlideUp 200ms ease;
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      overflow: hidden;
    }

    .popup-closing .popup {
      animation: popupSlideDown 200ms ease forwards;
    }

    @keyframes popupSlideUp {
      from { transform: translateY(20px) scale(0.95); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    @keyframes popupSlideDown {
      from { transform: translateY(0) scale(1); opacity: 1; }
      to { transform: translateY(20px) scale(0.95); opacity: 0; }
    }

    /* Sizes */
    .popup-sm { max-width: 360px; }
    .popup-md { max-width: 450px; }
    .popup-lg { max-width: 600px; }

    /* Header */
    .popup-header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-5);
      border-bottom: 1px solid var(--border-color);
    }

    .popup-icon {
      font-size: var(--text-2xl);
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--space-10);
      height: var(--space-10);
      border-radius: var(--radius-full);
      flex-shrink: 0;
    }

    .popup-icon-info { background: var(--info-color-light); color: var(--info-color-dark); }
    .popup-icon-success { background: var(--success-color-light); color: var(--success-color-dark); }
    .popup-icon-warning { background: var(--warning-color-light); color: var(--warning-color-dark); }
    .popup-icon-error { background: var(--danger-color-light); color: var(--danger-color-dark); }
    .popup-icon-confirm { background: var(--primary-color-lighter); color: var(--primary-color); }

    .popup-title {
      flex: 1;
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-color);
    }

    .popup-close {
      width: var(--control-height-sm);
      height: var(--control-height-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-xl);
      color: var(--text-color-secondary);
      background: transparent;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 150ms ease;
    }

    .popup-close:hover {
      background: var(--surface-hover);
      color: var(--text-color);
    }

    /* Body */
    .popup-body {
      padding: var(--space-5);
      overflow-y: auto;
    }

    .popup-message {
      margin: 0;
      font-size: var(--text-md);
      color: var(--text-color-secondary);
      line-height: 1.6;
    }

    /* Footer */
    .popup-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-5);
      border-top: 1px solid var(--border-color);
    }

    .popup-btn {
      padding: var(--space-2) var(--space-4);
      font-size: var(--text-sm);
      font-weight: 500;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 150ms ease;
    }

    .popup-btn-primary {
      background: var(--primary-color);
      color: var(--text-color-on-primary);
    }

    .popup-btn-primary:hover {
      background: var(--primary-color-dark);
    }

    .popup-btn-secondary {
      background: var(--surface-hover);
      color: var(--text-color);
    }

    .popup-btn-secondary:hover {
      background: var(--border-color);
    }

    .popup-btn-danger {
      background: var(--danger-color);
      color: var(--gray-0);
    }

    .popup-btn-danger:hover {
      background: var(--danger-color-dark);
    }

    .popup-btn-ghost {
      background: transparent;
      color: var(--text-color-secondary);
    }

    .popup-btn-ghost:hover {
      background: var(--surface-hover);
      color: var(--text-color);
    }
  `]
})
export class PopupContainerComponent {
  protected readonly popupService = inject(PopupService);

  onBackdropClick(popup: PopupItem): void {
    if (popup.closeOnBackdrop) {
      this.popupService.close(popup.id);
    }
  }

  onEscape(popup: PopupItem): void {
    if (popup.closable) {
      this.popupService.close(popup.id);
    }
  }

  onEnter(popup: PopupItem): void {
    if (popup.buttons && popup.buttons.length > 0) {
      const primaryBtn = popup.buttons.find(b => b.variant === 'primary' || !b.variant) || popup.buttons[0];
      if (primaryBtn && primaryBtn.action) {
        primaryBtn.action();
      }
    }
  }
}
