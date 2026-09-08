import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Alert, AuthLayoutComponent, ButtonComponent, Input as FormInput } from '@shared/ui';

import { AuthApiService } from '../../../core/auth/auth-api.service';
import { AuthStore } from '../../../core/auth/auth.store';
import {
  isDetailError,
  isLoginSuccess,
  isMfaRequired,
  isMfaSetupRequired,
} from '../../../core/auth/auth.models';
import { extractErrorMessage } from '../../../core/http/api.util';

/**
 * Login de la CONSOLA DEL DUEÑO (identidad de plataforma). Tres salidas del backend:
 * tokens (entra), `mfaRequired` (pide el código) o `mfaSetupRequired` (MFA obligatorio
 * aún no enrolado: se guarda el token de arranque y se va a /activar-mfa). Los
 * rechazos (credenciales, bloqueo) llegan como detailError y se pintan inline.
 */
@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AuthLayoutComponent, ButtonComponent, FormInput, Alert],
  template: `
    <app-auth-layout>
      <div slot="banner">
        <h2 class="brand-title">Sistema de Citas Médicas</h2>
      </div>

      <div slot="header">
        <h1 class="auth-title">Iniciar sesión</h1>
        <p class="auth-subtitle">Ingresa con tu usuario administrador.</p>
      </div>

      @if (errorMessage(); as message) {
        <app-alert kind="danger" spacing="compact">{{ message }}</app-alert>
      }

      @if (mfaRequired()) {
        <form [formGroup]="form" (ngSubmit)="submitMfa()" class="d-flex flex-col gap-4">
          <app-alert kind="info" spacing="compact">
            Ingresa el código de tu app de autenticación (o un código de recuperación).
          </app-alert>
          <app-input
            formControlName="mfaCode"
            label="Código de verificación"
            placeholder="123456"
            autocomplete="one-time-code"
            [required]="true"
          />
          <div class="d-flex gap-3">
            <app-button type="submit" variant="primary" size="lg" class="flex-1" [disabled]="loading()">
              {{ loading() ? 'Verificando…' : 'Verificar' }}
            </app-button>
            <app-button type="button" variant="ghost" size="lg" [disabled]="loading()" (buttonClick)="resetToCredentials()">
              Volver
            </app-button>
          </div>
        </form>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submitCredentials()" class="d-flex flex-col gap-4">
          <app-input
            formControlName="username"
            label="Usuario"
            placeholder="usuario"
            autocomplete="username"
            [required]="true"
          />
          <app-input
            formControlName="password"
            label="Contraseña"
            type="password"
            autocomplete="current-password"
            [revealable]="true"
            [required]="true"
          />
          <app-button type="submit" variant="primary" size="lg" [disabled]="loading()">
            {{ loading() ? 'Ingresando…' : 'Ingresar' }}
          </app-button>
        </form>
      }
    </app-auth-layout>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .auth-title {
        margin: 0;
        font-size: var(--text-2xl);
        color: var(--text-color);
      }
      .auth-subtitle {
        margin: var(--space-1) 0 0;
        color: var(--text-color-secondary);
        font-size: var(--text-sm);
      }
      .brand-eyebrow {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: var(--text-xs);
        font-weight: 700;
        opacity: 0.85;
      }
      .brand-title {
        margin: var(--space-3) 0;
        font-size: var(--text-2xl);
        line-height: 1.25;
      }
      .brand-copy {
        margin: 0;
        opacity: 0.85;
      }
    `,
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  /** El backend pidió el segundo factor: se muestra el campo de código. */
  protected readonly mfaRequired = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    mfaCode: [''],
  });

  protected submitCredentials(): void {
    if (this.form.controls.username.invalid || this.form.controls.password.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Ingresa usuario y contraseña.');
      return;
    }
    this.attemptLogin();
  }

  protected submitMfa(): void {
    if (!this.form.controls.mfaCode.value.trim()) {
      this.errorMessage.set('Ingresa el código de verificación.');
      return;
    }
    this.attemptLogin();
  }

  protected resetToCredentials(): void {
    this.mfaRequired.set(false);
    this.errorMessage.set(null);
    this.form.controls.mfaCode.setValue('');
  }

  private attemptLogin(): void {
    const { username, password, mfaCode } = this.form.getRawValue();
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authApi
      .login({ Username: username, Password: password, MfaCode: mfaCode.trim() || undefined })
      .subscribe({
        next: (result) => {
          this.loading.set(false);

          if (isLoginSuccess(result)) {
            this.authStore.setSession(result, { username: result.username ?? username });
            void this.router.navigateByUrl(this.returnUrl());
            return;
          }

          if (isMfaSetupRequired(result)) {
            // MFA obligatorio aún no enrolado: token de arranque (solo memoria) y a enrolar.
            this.authStore.setSetupToken(result.setupToken, result.username ?? username);
            void this.router.navigateByUrl('/activar-mfa');
            return;
          }

          if (isMfaRequired(result)) {
            this.mfaRequired.set(true);
            return;
          }

          if (isDetailError(result)) {
            this.errorMessage.set(result.detailError.message || 'Credenciales inválidas.');
            return;
          }

          this.errorMessage.set('No se pudo iniciar sesión. Intenta nuevamente.');
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(extractErrorMessage(error));
        },
      });
  }

  private returnUrl(): string {
    const param = new URLSearchParams(window.location.search).get('returnUrl');
    return param && param.startsWith('/') ? param : '/app';
  }
}
