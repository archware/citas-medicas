import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  Alert,
  ButtonComponent,
  CardComponent,
  DataTable,
  FormDialog,
  FormDialogActions,
  Input as FormInput,
  PageHeader,
  ToastService,
  type DataTableColumn,
  type DataTableStatus,
} from '@shared/ui';

import { AdminApiService } from '../../core/admin/admin-api.service';
import type { Administrador } from '../../core/admin/admin.models';
import { extractErrorMessage } from '../../core/http/api.util';

/**
 * ADMINISTRADORES DE PLATAFORMA (quién puede entrar a esta consola). El alta exige la
 * política de contraseñas del chasis (mín. 12, mayúscula, minúscula, dígito, símbolo);
 * el nuevo administrador enrolará su segundo factor en su primer login (obligatorio).
 */
@Component({
  selector: 'app-administradores',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PageHeader, CardComponent, DataTable, FormDialog, FormDialogActions, FormInput, ButtonComponent, Alert],
  template: `
    <app-page-header
      eyebrow="Plataforma"
      title="Administradores"
      subtitle="Las cuentas que pueden entrar a esta consola. Todas exigen segundo factor."
    >
      <div page-header-actions class="d-flex gap-3">
        <app-button iconClass="fa-user-plus" (buttonClick)="abrirAlta()">Nuevo administrador</app-button>
      </div>
    </app-page-header>

    <app-card class="mt-4">
      <prest-data-table
        caption="Administradores de plataforma"
        [columns]="columns"
        [rows]="rows()"
        [status]="status()"
        emptyMessage="No hay administradores registrados."
        [errorMessage]="errorListado()"
        (retry)="cargar()"
      />
    </app-card>

    @if (dialogoAbierto()) {
      <prest-form-dialog
        title="Nuevo administrador"
        eyebrow="Plataforma"
        description="Creará una cuenta activa; en su primer ingreso deberá activar el segundo factor."
        size="md"
        [opened]="dialogoAbierto()"
        [busy]="guardando()"
        (cancelled)="cerrarDialogo()"
        (closed)="cerrarDialogo()"
      >
        <app-button dialog-close type="button" variant="ghost" (buttonClick)="cerrarDialogo()">Cerrar</app-button>

        @if (errorFormulario(); as e) {
          <app-alert kind="danger" spacing="compact">{{ e }}</app-alert>
        }

        <form [formGroup]="form" class="d-flex flex-col gap-4" novalidate>
          <app-input
            formControlName="username"
            label="Usuario"
            placeholder="dueno.saas"
            autocomplete="off"
            [required]="true"
            [error]="err('username')"
            hint="3 a 64 caracteres: minúsculas, dígitos, punto, guion o guion bajo."
          />
          <app-input
            formControlName="password"
            label="Contraseña"
            type="password"
            autocomplete="new-password"
            [revealable]="true"
            [required]="true"
            [error]="err('password')"
            hint="Mínimo 12 caracteres con mayúscula, minúscula, dígito y símbolo."
          />
          <app-input
            formControlName="confirmar"
            label="Confirmar contraseña"
            type="password"
            autocomplete="new-password"
            [revealable]="true"
            [required]="true"
            [error]="err('confirmar')"
          />
        </form>

        <prest-form-dialog-actions>
          <app-button type="button" variant="ghost" [disabled]="guardando()" (buttonClick)="cerrarDialogo()">Cancelar</app-button>
          <app-button type="button" [disabled]="guardando()" (buttonClick)="guardar()">
            {{ guardando() ? 'Creando…' : 'Crear administrador' }}
          </app-button>
        </prest-form-dialog-actions>
      </prest-form-dialog>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
    `,
  ],
})
export class AdministradoresComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);

  protected readonly rows = signal<readonly Administrador[]>([]);
  protected readonly status = signal<DataTableStatus>('loading');
  protected readonly errorListado = signal('No se pudieron cargar los administradores.');
  protected readonly dialogoAbierto = signal(false);
  protected readonly guardando = signal(false);
  protected readonly errorFormulario = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.pattern(/^[a-z0-9._-]{3,64}$/)]],
    password: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(128)]],
    confirmar: ['', [Validators.required]],
  });

  protected readonly columns: DataTableColumn<Administrador>[] = [
    { key: 'username', header: 'Usuario' },
    { key: 'estado', header: 'Estado', isBadge: true },
    { key: 'mfaHabilitado', header: 'Segundo factor', isBadge: true, value: (r) => (r.mfaHabilitado ? 'Activo' : 'Pendiente') },
    { key: 'createdAtUtc', header: 'Creado', value: (r) => r.createdAtUtc?.slice(0, 10) ?? '' },
    { key: 'ultimoLoginUtc', header: 'Último acceso', value: (r) => r.ultimoLoginUtc?.slice(0, 16)?.replace('T', ' ') ?? '—' },
  ];

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.status.set('loading');
    this.api.administradores().subscribe({
      next: (lista) => {
        this.rows.set(lista);
        this.status.set(lista.length ? 'success' : 'empty');
      },
      error: (error) => {
        this.rows.set([]);
        this.errorListado.set(extractErrorMessage(error));
        this.status.set('error');
      },
    });
  }

  protected abrirAlta(): void {
    this.form.reset({ username: '', password: '', confirmar: '' });
    this.errorFormulario.set(null);
    this.dialogoAbierto.set(true);
  }

  protected cerrarDialogo(): void {
    if (this.guardando()) {
      return;
    }
    this.dialogoAbierto.set(false);
  }

  protected err(path: 'username' | 'password' | 'confirmar'): string {
    const control = this.form.controls[path];
    if (!control.touched || control.valid) {
      return path === 'confirmar' && control.touched && this.noCoinciden() ? 'Las contraseñas no coinciden.' : '';
    }
    if (control.hasError('required')) {
      return 'Campo obligatorio.';
    }
    if (control.hasError('minlength')) {
      return 'Mínimo 12 caracteres.';
    }
    if (control.hasError('maxlength')) {
      return 'Máximo 128 caracteres.';
    }
    if (control.hasError('pattern')) {
      return 'Solo minúsculas, dígitos, punto, guion o guion bajo (3 a 64).';
    }
    return 'Valor inválido.';
  }

  private noCoinciden(): boolean {
    const v = this.form.getRawValue();
    return v.password !== v.confirmar;
  }

  protected guardar(): void {
    if (this.form.invalid || this.noCoinciden()) {
      this.form.markAllAsTouched();
      this.errorFormulario.set(this.noCoinciden() ? 'Las contraseñas no coinciden.' : 'Revisa los campos marcados.');
      return;
    }
    const v = this.form.getRawValue();
    this.guardando.set(true);
    this.errorFormulario.set(null);
    this.api.crearAdministrador({ username: v.username.trim(), password: v.password }).subscribe({
      next: (creado) => {
        this.guardando.set(false);
        this.dialogoAbierto.set(false);
        this.toast.success(`Administrador ${creado.username} creado. Activará su segundo factor al entrar.`);
        this.cargar();
      },
      error: (error) => {
        this.guardando.set(false);
        this.errorFormulario.set(extractErrorMessage(error));
      },
    });
  }
}
