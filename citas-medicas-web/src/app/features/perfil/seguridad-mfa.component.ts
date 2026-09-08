import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs';

import { Alert, ButtonComponent, CardComponent, Input as FormInput, PageHeader, ToastService } from '@shared/ui';

import { AuthApiService } from '../../core/auth/auth-api.service';
import { AuthStore } from '../../core/auth/auth.store';
import { SUPRIMIR_TOAST_NEGOCIO, apiUrl } from '../../core/http/api.util';
import type { Perfil } from '../../core/auth/auth.models';

/**
 * Seguridad de la cuenta de plataforma: perfil y estado del segundo factor. El MFA
 * es OBLIGATORIO, así que aquí no se "activa" (eso ocurre en el login): solo se puede
 * DESACTIVAR con un código válido para cambiar de app autenticadora — la sesión se
 * cierra y el siguiente login vuelve a exigir el enrolamiento.
 */
@Component({
  selector: 'app-seguridad-mfa',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SlicePipe, PageHeader, CardComponent, FormInput, ButtonComponent, Alert],
  template: `
    <app-page-header
      eyebrow="Mi cuenta"
      title="Seguridad"
      subtitle="Tu cuenta gobierna todas las empresas: el segundo factor es obligatorio."
    />

    <app-card class="mt-4" title="Perfil" icon="fa-solid fa-user-shield">
      @if (perfil(); as p) {
        <dl class="perfil">
          <dt>Usuario</dt><dd>{{ p.username }}</dd>
          <dt>Estado</dt><dd>{{ p.estado }}</dd>
          <dt>Segundo factor</dt><dd>{{ p.mfaHabilitado ? 'Activo' : 'Pendiente' }}</dd>
          <dt>Último acceso</dt><dd>{{ p.ultimoLoginUtc ? (p.ultimoLoginUtc | slice: 0 : 16) : '—' }}</dd>
        </dl>
      } @else {
        <p>Cargando…</p>
      }
    </app-card>

    <app-card class="mt-4" title="Segundo factor" icon="fa-solid fa-shield-halved">
      @if (error(); as e) {
        <app-alert kind="danger" spacing="compact">{{ e }}</app-alert>
      }

      @if (habilitado()) {
        <app-alert kind="success" spacing="compact">
          El segundo factor está <strong>activo</strong>. Para cambiar de app autenticadora, desactívalo con un
          código válido: se cerrará la sesión y al volver a entrar lo activarás de nuevo.
        </app-alert>
        <form [formGroup]="form" (ngSubmit)="desactivar()" class="d-flex flex-col gap-4 formulario">
          <app-input
            formControlName="codigo"
            label="Código para desactivar"
            placeholder="123456 o código de recuperación"
            autocomplete="one-time-code"
            [required]="true"
          />
          <app-button type="submit" variant="ghost" size="lg" [disabled]="procesando()">
            {{ procesando() ? 'Desactivando…' : 'Desactivar y volver a enrolar' }}
          </app-button>
        </form>
      } @else {
        <app-alert kind="warning" spacing="compact">
          El segundo factor está pendiente: se activa al iniciar sesión.
        </app-alert>
      }
    </app-card>
  `,
  styles: [
    `
      :host { display: block; }
      .formulario { max-width: 24rem; }
      .perfil {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: var(--space-2) var(--space-4);
        margin: 0;
      }
      .perfil dt { color: var(--text-color-secondary); }
      .perfil dd { margin: 0; }
    `,
  ],
})
export class SeguridadMfaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly authApi = inject(AuthApiService);
  private readonly authStore = inject(AuthStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly perfil = signal<Perfil | null>(null);
  protected readonly habilitado = signal(false);
  protected readonly procesando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required]],
  });

  constructor() {
    this.authApi.me().subscribe({
      next: (p) => {
        this.perfil.set(p);
        this.habilitado.set(p.mfaHabilitado);
      },
      error: () => this.error.set('No se pudo cargar el perfil.'),
    });
  }

  protected desactivar(): void {
    if (this.form.invalid) {
      this.error.set('Ingresa un código para desactivar.');
      return;
    }
    this.procesando.set(true);
    this.error.set(null);
    const context = new HttpContext().set(SUPRIMIR_TOAST_NEGOCIO, true);
    this.http
      .post<unknown>(apiUrl('/api/v1/plataforma/auth/mfa/disable'), { code: this.form.controls.codigo.value.trim() }, { context })
      .pipe(
        map((r) => {
          const raw = (r ?? {}) as { detailError?: { message: string }; value?: string };
          return raw.detailError
            ? { exito: false, mensaje: raw.detailError.message }
            : { exito: true, mensaje: typeof raw.value === 'string' ? raw.value : 'Segundo factor desactivado.' };
        }),
      )
      .subscribe({
        next: (r) => {
          this.procesando.set(false);
          if (!r.exito) {
            this.error.set(r.mensaje);
            return;
          }
          this.toast.success(r.mensaje);
          // Sin segundo factor no hay consola: se cierra la sesión y el login exigirá enrolarlo.
          const acceso = this.authStore.token();
          const refresh = this.authStore.refreshToken();
          this.authStore.logout();
          void this.router.navigate(['/login']);
          this.authApi.logout(acceso, refresh).subscribe();
        },
        error: () => {
          this.procesando.set(false);
          this.error.set('No se pudo desactivar el segundo factor.');
        },
      });
  }
}
