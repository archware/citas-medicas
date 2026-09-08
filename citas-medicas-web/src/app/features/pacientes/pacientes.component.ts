import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PacientesApiService, PacienteResumen } from '../../core/api/pacientes-api.service';
import { ButtonComponent, DataTable, DataTableColumn, ActionGroupComponent, ActionItem, InputComponent } from '../../shared/ui';
import { NuevoPacienteComponent } from './nuevo-paciente.component';
import { EditarPacienteComponent } from './editar-paciente.component';

@Component({
  selector: 'app-pacientes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, DataTable, ActionGroupComponent, InputComponent, NuevoPacienteComponent, EditarPacienteComponent],
  template: `
    <div class="page-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h1>Pacientes</h1>
        <app-button (buttonClick)="mostrarNuevo.set(true)">Nuevo Paciente</app-button>
      </div>

      <div style="display: flex; gap: 16px; margin-bottom: 16px;">
        <div style="flex: 1; max-width: 300px;">
          <app-input type="text" placeholder="Buscar por DNI..." [(ngModel)]="filtroDoc" (keyup.enter)="cargar()"></app-input>
        </div>
        <div style="flex: 1; max-width: 300px;">
          <app-input type="text" placeholder="Buscar por Nombre..." [(ngModel)]="filtroNom" (keyup.enter)="cargar()"></app-input>
        </div>
        <app-button variant="secondary" (buttonClick)="cargar()">Buscar</app-button>
      </div>
      
      <div style="margin-top: 16px;">
        <app-data-table
          caption="Lista de Pacientes"
          [columns]="columnas"
          [rows]="pacientes()"
          [status]="cargando() ? 'loading' : pacientes().length > 0 ? 'success' : 'empty'"
          pagination="client"
        >
          <ng-template #actions let-ctx>
            <app-action-group [compact]="true" [actions]="rowActions" (actionClick)="onRowAction($event, ctx)"></app-action-group>
          </ng-template>
        </app-data-table>
      </div>
    </div>

    <app-nuevo-paciente [(opened)]="mostrarNuevo" (registrado)="cargar()" />
    <app-editar-paciente [(opened)]="mostrarEditar" [paciente]="pacienteSeleccionado()" (actualizado)="cargar()" />
  `
})
export class PacientesComponent implements OnInit {
  private readonly api = inject(PacientesApiService);

  protected readonly mostrarNuevo = signal(false);
  protected readonly mostrarEditar = signal(false);
  protected readonly pacienteSeleccionado = signal<PacienteResumen | null>(null);
  
  protected readonly cargando = signal(false);
  protected readonly pacientes = signal<PacienteResumen[]>([]);

  protected filtroDoc = '';
  protected filtroNom = '';

  readonly columnas: readonly DataTableColumn<PacienteResumen>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'numeroDocumento', header: 'DNI', sortable: true },
    { key: 'nombres', header: 'Nombres', sortable: true },
    { key: 'apellidos', header: 'Apellidos', sortable: true },
    { key: 'telefono', header: 'Teléfono', sortable: true },
    { key: 'correo', header: 'Correo', sortable: true }
  ];

  readonly rowActions: ActionItem[] = [
    { id: 'edit', icon: 'fa-solid fa-pen', label: 'Editar', variant: 'primary' },
    { id: 'delete', icon: 'fa-solid fa-trash', label: 'Eliminar', variant: 'danger' }
  ];

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.api.obtenerTodos(1, 50, this.filtroDoc, this.filtroNom).subscribe({
      next: (res: any) => {
        this.pacientes.set(res.value?.data || []);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  onRowAction(actionId: string, row: PacienteResumen) {
    if (actionId === 'edit') {
      this.pacienteSeleccionado.set(row);
      this.mostrarEditar.set(true);
    } else if (actionId === 'delete') {
      if (confirm(`¿Seguro que desea eliminar al paciente ${row.nombres}?`)) {
        this.api.eliminar(row.id).subscribe(() => this.cargar());
      }
    }
  }
}
