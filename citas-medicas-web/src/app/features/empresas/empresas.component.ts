import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import {
  Alert,
  ButtonComponent,
  CardComponent,
  DataTable,
  FormDialog,
  FormDialogActions,
  PageHeader,
  TableAction,
  ToastService,
  type DataTableColumn,
  type DataTableStatus,
} from '@shared/ui';

import { AdminApiService } from '../../core/admin/admin-api.service';
import { etiquetaEstado, type TenantResumen } from '../../core/admin/admin.models';
import { extractErrorMessage } from '../../core/http/api.util';

type Transicion = 'suspender' | 'baja' | 'reactivar';

interface Confirmacion {
  empresa: TenantResumen;
  accion: Transicion;
}

/**
 * EMPRESAS de la plataforma (todas: activas, suspendidas, de baja, en aprovisionamiento)
 * con las transiciones del ciclo de vida: suspender (impago, reversible), dar de baja
 * (formal, conserva datos) y reactivar (exige que la BD exista). Cada transición se
 * confirma en un diálogo y el error de negocio se muestra dentro del diálogo.
 */
@Component({
  selector: 'app-empresas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, CardComponent, DataTable, TableAction, FormDialog, FormDialogActions, ButtonComponent, Alert],
  template: `
    <app-page-header
      eyebrow="Plataforma"
      title="Empresas"
      subtitle="Todas las empresas del SaaS y su estado: aquí se suspende por impago, se da de baja y se reactiva."
      headingId="empresas-title"
    >
      <div page-header-actions class="d-flex gap-3">
        <app-button iconClass="fa-plus" (buttonClick)="nueva()">Nueva empresa</app-button>
      </div>
    </app-page-header>

    <app-card class="mt-4">
      <app-data-table
        caption="Empresas registradas"
        [columns]="columns"
        [rows]="rows()"
        [status]="status()"
        pagination="client"
        emptyMessage="Aún no hay empresas. Da de alta la primera con «Nueva empresa»."
        [errorMessage]="errorListado()"
        actionsWidth="16rem"
        (retry)="cargar()"
      >
        <ng-template #actions let-row>
          @if (row.estado === 'Active') {
            <app-table-action action="deactivate" label="Suspender (impago)" size="md" (triggered)="confirmar(row, 'suspender')" />
            <app-table-action action="delete" label="Dar de baja" size="md" (triggered)="confirmar(row, 'baja')" />
          } @else if (row.estado === 'Suspended' || row.estado === 'Deactivated') {
            <app-table-action action="activate" label="Reactivar" size="md" (triggered)="confirmar(row, 'reactivar')" />
          }
        </ng-template>
      </app-data-table>
    </app-card>

    @if (confirmacion(); as c) {
      <app-form-dialog
        [title]="titulo(c.accion)"
        eyebrow="Ciclo de vida"
        [description]="c.empresa.razonSocial + ' · RUC ' + c.empresa.ruc"
        size="sm"
        [opened]="true"
        [busy]="procesando()"
        (cancelled)="cerrar()"
        (closed)="cerrar()"
      >
        <app-button dialog-close type="button" variant="ghost" (buttonClick)="cerrar()">Cerrar</app-button>

        @if (errorDialogo(); as e) {
          <app-alert kind="danger" spacing="compact">{{ e }}</app-alert>
        }
        <p class="explicacion">{{ explicacion(c.accion) }}</p>

        <app-form-dialog-actions>
          <app-button type="button" variant="ghost" [disabled]="procesando()" (buttonClick)="cerrar()">Cancelar</app-button>
          <app-button type="button" [disabled]="procesando()" (buttonClick)="ejecutar()">
            {{ procesando() ? 'Aplicando…' : titulo(c.accion) }}
          </app-button>
        </app-form-dialog-actions>
      </app-form-dialog>
    }
  `,
  styleUrl: './empresas.component.css',
})
export class EmpresasComponent {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly rows = signal<readonly TenantResumen[]>([]);
  protected readonly status = signal<DataTableStatus>('loading');
  protected readonly errorListado = signal('No se pudieron cargar las empresas.');
  protected readonly confirmacion = signal<Confirmacion | null>(null);
  protected readonly procesando = signal(false);
  protected readonly errorDialogo = signal<string | null>(null);

  protected readonly columns: DataTableColumn<TenantResumen>[] = [
    { key: 'ruc', header: 'RUC' },
    { key: 'razonSocial', header: 'Razón social' },
    { key: 'estado', header: 'Estado', isBadge: true, value: (r) => etiquetaEstado(r.estado) },
    { key: 'usuarios', header: 'Usuarios', align: 'end' },
    { key: 'createdAtUtc', header: 'Alta', value: (r) => r.createdAtUtc?.slice(0, 10) ?? '' },
    { key: 'deactivatedAtUtc', header: 'Suspendida / baja', value: (r) => r.deactivatedAtUtc?.slice(0, 10) ?? '—' },
    { key: 'dbName', header: 'Base de datos' },
  ];

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.status.set('loading');
    this.api.tenants().subscribe({
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

  protected nueva(): void {
    void this.router.navigateByUrl('/app/empresas/nueva');
  }

  protected confirmar(empresa: TenantResumen, accion: Transicion): void {
    this.errorDialogo.set(null);
    this.confirmacion.set({ empresa, accion });
  }

  protected cerrar(): void {
    if (this.procesando()) {
      return;
    }
    this.confirmacion.set(null);
    this.errorDialogo.set(null);
  }

  protected ejecutar(): void {
    if (this.procesando()) {
      // Guarda de doble envío: el clic repetido no dispara una segunda transición.
      return;
    }
    const c = this.confirmacion();
    if (!c) {
      return;
    }
    this.procesando.set(true);
    this.errorDialogo.set(null);

    const llamada =
      c.accion === 'suspender'
        ? this.api.suspender(c.empresa.ruc)
        : c.accion === 'baja'
          ? this.api.baja(c.empresa.ruc)
          : this.api.reactivar(c.empresa.ruc);

    llamada.subscribe({
      next: (r) => {
        this.procesando.set(false);
        this.confirmacion.set(null);
        this.toast.success(`${r.razonSocial}: ${etiquetaEstado(r.estadoAnterior)} → ${etiquetaEstado(r.estado)}.`);
        this.cargar();
      },
      error: (error) => {
        this.procesando.set(false);
        this.errorDialogo.set(extractErrorMessage(error));
      },
    });
  }

  protected titulo(accion: Transicion): string {
    switch (accion) {
      case 'suspender':
        return 'Suspender empresa';
      case 'baja':
        return 'Dar de baja';
      default:
        return 'Reactivar empresa';
    }
  }

  protected explicacion(accion: Transicion): string {
    switch (accion) {
      case 'suspender':
        return 'Bloqueo TEMPORAL por falta de pago: nadie de la empresa podrá entrar hasta que la reactives. No se borra nada.';
      case 'baja':
        return 'Baja FORMAL: deja de ofrecerse en el login y de resolver conexión. Se conservan el registro y la base de datos; se puede reactivar después.';
      default:
        return 'Vuelve a habilitar la empresa. Solo si su base de datos existe y responde.';
    }
  }
}
