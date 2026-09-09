import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import QRCode from 'qrcode';

import { Alert, AuthLayoutComponent, ButtonComponent, Input as FormInput } from '@shared/ui';

import { AuthApiService } from '../../../core/auth/auth-api.service';
import { AuthStore } from '../../../core/auth/auth.store';

/**
 * Enrolamiento OBLIGATORIO del segundo factor tras el primer login (o tras
 * desactivarlo): el login entregÃ³ un token de ARRANQUE (scope plataforma.setup) que
 * solo sirve aquÃ­. Pasos: generar la clave â†’ aÃ±adirla en la app de autenticaciÃ³n â†’
 * confirmar con un cÃ³digo â†’ guardar los cÃ³digos de recuperaciÃ³n â†’ volver al login.
 */
@Component({
  selector: 'app-activar-mfa',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AuthLayoutComponent, ButtonComponent, FormInput, Alert],
  template: `
    <app-auth-layout>
      <div slot="banner">
        <p class="brand-eyebrow">Sistema de Citas Médicas</p>
        <h2 class="brand-title">Consola del dueÃ±o</h2>
        <p class="brand-copy">La cuenta que gobierna todas las empresas exige un segundo factor.</p>
      </div>

      <div slot="header">
        <h1 class="auth-title">Activar el segundo factor</h1>
        <p class="auth-subtitle">
          @if (username()) {
            Cuenta <strong>{{ username() }}</strong>.
          }
          Necesitas una app de autenticaciÃ³n (Google Authenticator, Authy, Microsoft Authenticatorâ€¦).
        </p>
      </div>

      @if (error(); as e) {
        <app-alert kind="danger" spacing="compact">{{ e }}</app-alert>
      }

      @switch (paso()) {
        @case ('inicio') {
          <div class="d-flex flex-col gap-4">
            <app-alert kind="info" spacing="compact">
              Tu contraseÃ±a es correcta, pero aÃºn no tienes segundo factor. Es obligatorio para entrar a la consola.
            </app-alert>
            <div class="d-flex gap-3">
              <app-button variant="primary" size="lg" class="flex-1" [disabled]="procesando()" (buttonClick)="generar()">
                {{ procesando() ? 'Generandoâ€¦' : 'Generar clave' }}
              </app-button>
              <app-button type="button" variant="ghost" size="lg" (buttonClick)="volverAlLogin()">Volver</app-button>
            </div>
          </div>
        }

        @case ('configurando') {
          <ol class="pasos">
            <li>Abre tu app de autenticaciÃ³n (Microsoft/Google Authenticator, Authyâ€¦) y aÃ±ade una cuenta.</li>
            <li><strong>Escanea este cÃ³digo QR</strong> â€” o, si no puedes, ingresa la clave manualmente:</li>
          </ol>
          @if (qrSvg(); as qr) {
            <div class="qr" role="img" aria-label="CÃ³digo QR para dar de alta la cuenta en la app de autenticaciÃ³n" [innerHTML]="qr"></div>
          }
          <p class="secreto">{{ secret() }}</p>
          <form [formGroup]="form" (ngSubmit)="confirmar()" class="d-flex flex-col gap-4 formulario">
            <app-input
              formControlName="codigo"
              label="CÃ³digo de 6 dÃ­gitos que muestra la app"
              placeholder="123456"
              autocomplete="one-time-code"
              [required]="true"
            />
            <div class="d-flex gap-3">
              <app-button type="submit" variant="primary" size="lg" class="flex-1" [disabled]="procesando()">
                {{ procesando() ? 'Confirmandoâ€¦' : 'Confirmar y activar' }}
              </app-button>
              <app-button type="button" variant="ghost" size="lg" [disabled]="procesando()" (buttonClick)="volverAlLogin()">
                Cancelar
              </app-button>
            </div>
          </form>
        }

        @case ('codigos') {
          <app-alert kind="warning" spacing="compact">
            Guarda estos <strong>cÃ³digos de recuperaciÃ³n</strong> en un lugar seguro. Cada uno sirve una sola vez
            si pierdes el acceso a tu app. No se volverÃ¡n a mostrar.
          </app-alert>
          <ul class="codigos">
            @for (c of recoveryCodes(); track c) {
              <li>{{ c }}</li>
            }
          </ul>
          <app-button variant="primary" size="lg" (buttonClick)="terminar()">Ya los guardÃ©, ir a iniciar sesiÃ³n</app-button>
        }
      }
    </app-auth-layout>
  `,
  styles: [
    `
      :host { display: block; }
      .auth-title { margin: 0; font-size: var(--text-2xl); color: var(--text-color); }
      .auth-subtitle { margin: var(--space-1) 0 0; color: var(--text-color-secondary); font-size: var(--text-sm); }
      .brand-eyebrow { margin: 0; text-transform: uppercase; letter-spacing: 0.08em; font-size: var(--text-xs); font-weight: 700; opacity: 0.85; }
      .brand-title { margin: var(--space-3) 0; font-size: var(--text-2xl); line-height: 1.25; }
      .brand-copy { margin: 0; opacity: 0.85; }
      .pasos { margin: 0 0 var(--space-3); padding-left: 1.2rem; color: var(--text-color-secondary); }
      .qr {
        /* Fondo claro fijo: un QR sobre fondo oscuro no lo leen todas las cÃ¡maras. */
        width: max-content;
        /* Contraste FISICO de escaneo: el recuadro del QR debe ser claro
           incluso en tema oscuro (como el papel del ticket); no es un color
           tematico y por eso no usa token. */
        background: white;
        border: 1px solid var(--surface-border, var(--surface-hover));
        border-radius: var(--radius-md);
        padding: var(--space-3);
        margin: 0 0 var(--space-3);
      }
      /* ::ng-deep: el SVG llega por innerHTML y no lleva el atributo de scoping. */
      .qr ::ng-deep svg {
        display: block;
        width: 13rem;
        height: 13rem;
      }
      .secreto {
        font-family: ui-monospace, monospace;
        font-size: var(--text-lg);
        letter-spacing: 0.12em;
        background: var(--surface-hover);
        padding: var(--space-3);
        border-radius: var(--radius-md);
        word-break: break-all;
        margin: 0 0 var(--space-4);
      }
      .formulario { max-width: 24rem; }
      .codigos {
        list-style: none;
        padding: 0;
        margin: var(--space-3) 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
        gap: var(--space-2);
      }
      .codigos li {
        font-family: ui-monospace, monospace;
        letter-spacing: 0.08em;
        background: var(--surface-hover);
        padding: var(--space-2) var(--space-3);
        border-radius: var(--radius-sm);
        text-align: center;
      }
    `,
  ],
})
export class ActivarMfaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly username = this.authStore.setupUsername;
  protected readonly paso = signal<'inicio' | 'configurando' | 'codigos'>('inicio');
  protected readonly procesando = signal(false);
  protected readonly secret = signal('');
  protected readonly otpauthUri = signal('');
  /** QR de la URL otpauth (SVG generado localmente): escanear y listo. */
  protected readonly qrSvg = signal<SafeHtml | null>(null);
  protected readonly recoveryCodes = signal<readonly string[]>([]);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required]],
  });

  protected generar(): void {
    this.procesando.set(true);
    this.error.set(null);
    this.authApi.mfaSetup().subscribe({
      next: (r) => {
        this.procesando.set(false);
        if (!r.exito) {
          this.error.set(r.mensaje ?? 'No se pudo iniciar la configuraciÃ³n.');
          return;
        }
        this.secret.set(r.secret ?? '');
        this.otpauthUri.set(r.otpauthUri ?? '');
        void this.generarQr(r.otpauthUri ?? '');
        this.form.controls.codigo.setValue('');
        this.paso.set('configurando');
      },
      error: () => {
        this.procesando.set(false);
        this.error.set('No se pudo iniciar la configuraciÃ³n. Vuelve a iniciar sesiÃ³n e intÃ©ntalo de nuevo.');
      },
    });
  }

  protected confirmar(): void {
    if (this.form.invalid) {
      this.error.set('Ingresa el cÃ³digo que muestra la app.');
      return;
    }
    this.procesando.set(true);
    this.error.set(null);
    this.authApi.mfaEnable(this.form.controls.codigo.value.trim()).subscribe({
      next: (r) => {
        this.procesando.set(false);
        if (!r.exito) {
          this.error.set(r.mensaje ?? 'CÃ³digo invÃ¡lido.');
          return;
        }
        this.recoveryCodes.set(r.recoveryCodes ?? []);
        this.paso.set('codigos');
      },
      error: () => {
        this.procesando.set(false);
        this.error.set('No se pudo activar el segundo factor.');
      },
    });
  }

  /** El QR se dibuja en el navegador (nada viaja fuera); si falla, queda la clave manual. */
  private async generarQr(uri: string): Promise<void> {
    if (!uri) {
      this.qrSvg.set(null);
      return;
    }
    try {
      // width explÃ­cito: el SVG entra por innerHTML y el CSS encapsulado del
      // componente no lo alcanza; sin atributos de tamaÃ±o no se pintarÃ­a.
      const svg = await QRCode.toString(uri, { type: 'svg', margin: 0, width: 208, errorCorrectionLevel: 'M' });
      this.qrSvg.set(this.sanitizer.bypassSecurityTrustHtml(svg));
    } catch {
      this.qrSvg.set(null);
    }
  }

  /** Enrolado: el token de arranque ya no sirve; se entra de nuevo con usuario, contraseÃ±a y cÃ³digo. */
  protected terminar(): void {
    this.authStore.clearSetupToken();
    void this.router.navigate(['/login']);
  }

  protected volverAlLogin(): void {
    this.authStore.clearSetupToken();
    void this.router.navigate(['/login']);
  }
}

