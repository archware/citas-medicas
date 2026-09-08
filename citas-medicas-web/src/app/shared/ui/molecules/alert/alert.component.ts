/**
 * Alert unificado (5.4.0). Sustituye la implementacion previa del ADN, que
 * divergia del consumidor en nombres de entrada y perdia por merito tecnico:
 *
 * - `variant` -> `kind` y `flowSpacing` -> `spacing`: mismo conjunto de valores,
 *   renombrado puro. `AlertKind` conserva su nombre porque es contrato de
 *   dominio en el consumidor (credit-score-presentation.ts).
 * - Se retiran `size` y `message`. `size` no tenia ningun uso legitimo y
 *   competia con el sistema de espaciado; `message` duplicaba la proyeccion de
 *   contenido, que pasa a ser el unico canal del cuerpo.
 * - `role` condicional: `alert` solo para `danger`, `status` para el resto. El
 *   anterior fijaba role="alert" -que implica aria-live assertive- y luego lo
 *   sobrescribia con polite: una combinacion contradictoria.
 * - Signals en vez de campos planos: con provideZonelessChangeDetection, el
 *   `dismiss()` anterior escribia un campo que no agendaba deteccion de
 *   cambios, de modo que la alerta no llegaba a desaparecer.
 * - Mapa `Record<AlertKind, string>` exhaustivo: anadir un kind sin icono ahora
 *   falla en compilacion, donde el @switch anterior simplemente no pintaba.
 */
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

export type AlertKind = 'info' | 'success' | 'warning' | 'danger';
export type AlertSpacing = 'default' | 'compact' | 'none';

const ALERT_ICONS: Readonly<Record<AlertKind, string>> = {
  info: 'fa-circle-info',
  success: 'fa-circle-check',
  warning: 'fa-triangle-exclamation',
  danger: 'fa-circle-xmark',
};

@Component({
  selector: 'app-alert, prest-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="alert"
        [class]="classes()"
        [attr.role]="kind() === 'danger' ? 'alert' : 'status'"
        [attr.aria-live]="kind() === 'danger' ? 'assertive' : 'polite'"
      >
        <i class="fa-solid {{ iconClass() }} alert__icon" aria-hidden="true"></i>
        <div class="alert__body">
          @if (title()) {
            <strong class="alert__title">{{ title() }}</strong>
          }
          <div class="alert__message"><ng-content /></div>
        </div>
        @if (closable()) {
          <button class="alert__close" type="button" aria-label="Cerrar mensaje" (click)="close()">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        }
      </div>
    }
  `,
  styleUrl: './alert.scss',
  host: {
    '[class.alert-flow--default]': "spacing() === 'default'",
    '[class.alert-flow--compact]': "spacing() === 'compact'",
    '[class.alert-flow--none]': "spacing() === 'none'",
  },
})
export class Alert {
  readonly kind = input<AlertKind>('info');
  readonly title = input('');
  readonly closable = input(false);
  readonly spacing = input<AlertSpacing>('default');
  readonly closed = output<void>();

  protected readonly visible = signal(true);
  protected readonly iconClass = computed(() => ALERT_ICONS[this.kind()]);
  protected readonly classes = computed(() => `alert alert--${this.kind()}`);

  protected close(): void {
    this.visible.set(false);
    this.closed.emit();
  }
}
