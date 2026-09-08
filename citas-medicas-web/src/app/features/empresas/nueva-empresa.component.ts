import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Alert, ButtonComponent, CardComponent, Input as FormInput, PageHeader, ToastService } from '@shared/ui';

import { AdminApiService } from '../../core/admin/admin-api.service';
import { extractErrorMessage } from '../../core/http/api.util';

/**
 * ALTA DE EMPRESA (onboarding): el backend aprovisiona la BD del tenant con sus
 * migraciones y plan contable, crea el usuario administrador (hash BCrypt), siembra los
 * 7 roles de fábrica y la membresía — o compensa (deshace) si algo falla a mitad.
 * Las validaciones espejan las del servidor (RUC 11 dígitos; db_name ^[a-z][a-z0-9_]{2,60}$
 * sin contener el RUC; contraseña del administrador mínimo 8).
 */
@Component({
  selector: 'app-nueva-empresa',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PageHeader, CardComponent, FormInput, ButtonComponent, Alert],
  template: `
    <app-page-header
      eyebrow="Plataforma"
      title="Nueva empresa"
      subtitle="Da de alta una empresa completa: base de datos propia, usuario administrador y roles de fábrica."
    />

    <app-card class="mt-4" title="Datos de la empresa" icon="fa-solid fa-building">
      @if (error(); as e) {
        <app-alert kind="danger" spacing="compact">{{ e }}</app-alert>
      }

      <form [formGroup]="form" (ngSubmit)="guardar()" class="d-flex flex-col gap-4 formulario" novalidate>
        <app-input
          formControlName="ruc"
          label="RUC"
          placeholder="20123456789"
          inputMode="numeric"
          [maxLength]="11"
          [required]="true"
          [error]="err('ruc')"
          hint="11 dígitos. Solo identifica a la empresa; nunca forma parte del nombre de la base de datos."
        />
        <app-input
          formControlName="razonSocial"
          label="Razón social"
          placeholder="MI EMPRESA SAC"
          [maxLength]="250"
          [required]="true"
          [error]="err('razonSocial')"
        />
        <app-input
          formControlName="dbName"
          label="Nombre de la base de datos"
          placeholder="erp_miempresa"
          [required]="true"
          [error]="err('dbName')"
          hint="Minúsculas, dígitos y guion bajo; empieza por letra (3 a 61 caracteres). No puede contener el RUC."
        />
        <app-input
          formControlName="adminUsername"
          label="Usuario administrador de la empresa"
          placeholder="admin_miempresa"
          autocomplete="off"
          [maxLength]="255"
          [required]="true"
          [error]="err('adminUsername')"
        />
        <app-input
          formControlName="adminPassword"
          label="Contraseña del administrador"
          type="password"
          autocomplete="new-password"
          [revealable]="true"
          [required]="true"
          [error]="err('adminPassword')"
          hint="Mínimo 8 caracteres. Se guarda hasheada (BCrypt); entrégala al administrador por un canal seguro."
        />

        <div class="d-flex gap-3">
          <app-button type="submit" variant="primary" size="lg" [disabled]="guardando()">
            {{ guardando() ? 'Creando empresa…' : 'Crear empresa' }}
          </app-button>
          <app-button type="button" variant="ghost" size="lg" [disabled]="guardando()" (buttonClick)="cancelar()">
            Cancelar
          </app-button>
        </div>
      </form>
    </app-card>
  `,
  styleUrl: './nueva-empresa.component.css',
})
export class NuevaEmpresaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    ruc: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
    razonSocial: ['', [Validators.required, Validators.maxLength(250)]],
    dbName: ['', [Validators.required, Validators.pattern(/^[a-z][a-z0-9_]{2,60}$/)]],
    adminUsername: ['', [Validators.required, Validators.maxLength(255)]],
    adminPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected err(path: 'ruc' | 'razonSocial' | 'dbName' | 'adminUsername' | 'adminPassword'): string {
    const control = this.form.controls[path];
    if (!control.touched || control.valid) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Campo obligatorio.';
    }
    if (control.hasError('maxlength')) {
      return 'Texto demasiado largo.';
    }
    if (control.hasError('minlength')) {
      return 'Mínimo 8 caracteres.';
    }
    if (control.hasError('pattern')) {
      return path === 'ruc' ? 'El RUC debe tener 11 dígitos.' : 'Solo minúsculas, dígitos y guion bajo; empieza por letra.';
    }
    return 'Valor inválido.';
  }

  protected guardar(): void {
    if (this.guardando()) {
      // Guarda de doble envío: el clic repetido no dispara un segundo onboarding.
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Revisa los campos marcados.');
      return;
    }
    const v = this.form.getRawValue();
    if (v.dbName.includes(v.ruc)) {
      this.error.set('El nombre de la base de datos no puede contener el RUC.');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    this.api
      .onboard({
        ruc: v.ruc,
        razonSocial: v.razonSocial.trim(),
        dbName: v.dbName,
        adminUsername: v.adminUsername.trim(),
        adminPassword: v.adminPassword,
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.toast.success(`Empresa ${v.razonSocial.trim()} creada con su administrador ${v.adminUsername.trim()}.`);
          void this.router.navigateByUrl('/app/empresas');
        },
        error: (error) => {
          this.guardando.set(false);
          this.error.set(extractErrorMessage(error));
        },
      });
  }

  protected cancelar(): void {
    void this.router.navigateByUrl('/app/empresas');
  }
}
