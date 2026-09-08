import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CitasApiService, CitaResumen } from '../../core/api/citas-api.service';
import { ButtonComponent, DataTable, DataTableColumn, ActionGroupComponent, ActionItem, InputComponent } from '../../shared/ui';
import { NuevaCitaComponent } from './nueva-cita.component';
import { EditarCitaComponent } from './editar-cita.component';

@Component({
  selector: 'app-citas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe, ButtonComponent, DataTable, ActionGroupComponent, InputComponent, NuevaCitaComponent, EditarCitaComponent],
  providers: [DatePipe],
  template: `
    <div class="page-container">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h1>Citas médicas</h1>
        <app-button (buttonClick)="mostrarFormulario.set(true)">Nueva cita</app-button>
      </div>

      <div style="display: flex; gap: 16px; margin-bottom: 16px;">
        <div style="flex: 1; max-width: 200px;">
          <app-input type="date" placeholder="Fecha..." [(ngModel)]="filtroFecha" (keyup.enter)="cargar()"></app-input>
        </div>
        <div style="flex: 1; max-width: 200px;">
          <app-input type="text" placeholder="ID Médico..." [(ngModel)]="filtroMedico" (keyup.enter)="cargar()"></app-input>
        </div>
        <div style="flex: 1; max-width: 200px;">
          <app-input type="text" placeholder="Estado (ej. PROGRAMADA)" [(ngModel)]="filtroEstado" (keyup.enter)="cargar()"></app-input>
        </div>
        <app-button variant="secondary" (buttonClick)="cargar()">Buscar</app-button>
      </div>

      <div style="margin-top: 16px;">
        <app-data-table
          caption="Lista de Citas"
          [columns]="columnas"
          [rows]="citas()"
          [status]="cargando() ? 'loading' : citas().length > 0 ? 'success' : 'empty'"
          pagination="client"
        >
          <ng-template #actions let-ctx>
            <app-action-group [compact]="true" [actions]="rowActions" (actionClick)="onRowAction($event, ctx)"></app-action-group>
          </ng-template>
        </app-data-table>
      </div>
    </div>

    <app-nueva-cita [(opened)]="mostrarFormulario" (registrado)="cargar()" />
    <app-editar-cita [(opened)]="mostrarEditar" [cita]="citaSeleccionada()" (actualizado)="cargar()" />
  `
})
export class CitasComponent implements OnInit {
  private readonly api = inject(CitasApiService);
  private readonly datePipe = inject(DatePipe);

  protected readonly mostrarFormulario = signal(false);
  protected readonly mostrarEditar = signal(false);
  protected readonly citaSeleccionada = signal<CitaResumen | null>(null);

  protected readonly citas = signal<CitaResumen[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected filtroFecha = '';
  protected filtroMedico = '';
  protected filtroEstado = '';

  readonly columnas: readonly DataTableColumn<CitaResumen>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'nombrePaciente', header: 'Paciente', sortable: true },
    { key: 'nombreMedico', header: 'Médico', sortable: true },
    { key: 'fechaHora', header: 'Fecha', sortable: true, format: (val) => this.datePipe.transform(val as string, 'dd/MM/yyyy HH:mm') || '' },
    { key: 'estado', header: 'Estado', sortable: true },
    { key: 'motivo', header: 'Motivo', sortable: true },
    { key: 'diagnostico', header: 'Diagnóstico', sortable: true },
    { key: 'tratamiento', header: 'Tratamiento', sortable: true }
  ];

  readonly rowActions: ActionItem[] = [
    { id: 'edit', icon: 'fa-solid fa-pen', label: 'Editar', variant: 'primary' },
    { id: 'cancel', icon: 'fa-solid fa-ban', label: 'Cancelar Cita', variant: 'danger' }
  ];

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    let idMed = this.filtroMedico ? parseInt(this.filtroMedico) : undefined;
    this.api.listar(1, 50, idMed, this.filtroFecha, this.filtroEstado).subscribe({
      next: (res: any) => { this.citas.set(res.value?.data || []); this.cargando.set(false); },
      error: () => { this.error.set('No se pudieron cargar las citas.'); this.cargando.set(false); },
    });
  }

  onRowAction(actionId: string, row: CitaResumen) {
    if (actionId === 'edit') {
      this.citaSeleccionada.set(row);
      this.mostrarEditar.set(true);
    } else if (actionId === 'cancel') {
      if (confirm('¿Seguro que desea cancelar esta cita?')) {
        this.api.cancelar(row.id).subscribe({
          next: () => this.cargar(),
          error: (err: any) => {
             const msg = err.error?.detailError || err.error?.title || err.error?.message || 'Error al cancelar.';
             alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
          }
        });
      }
    }
  }
}
