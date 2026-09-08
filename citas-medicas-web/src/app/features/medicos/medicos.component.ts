import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MedicosApiService, MedicoResumen } from '../../core/api/medicos-api.service';
import { ButtonComponent, DataTable, DataTableColumn, ActionGroupComponent, ActionItem, InputComponent } from '../../shared/ui';
import { NuevoMedicoComponent } from './nuevo-medico.component';
import { EditarMedicoComponent } from './editar-medico.component';

@Component({
  selector: 'app-medicos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, DataTable, ActionGroupComponent, InputComponent, NuevoMedicoComponent, EditarMedicoComponent],
  template: `
    <div class="page-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h1>Medicos</h1>
        <app-button (buttonClick)="mostrarNuevo.set(true)">Nuevo Medico</app-button>
      </div>

      <div style="display: flex; gap: 16px; margin-bottom: 16px;">
        <div style="flex: 1; max-width: 400px;">
          <app-input type="text" placeholder="Buscar por nombre o especialidad..." [(ngModel)]="filtro" (keyup.enter)="cargar()"></app-input>
        </div>
        <app-button variant="secondary" (buttonClick)="cargar()">Buscar</app-button>
      </div>

      <app-data-table
        caption="Lista de Medicos"
        [columns]="columnas"
        [rows]="medicos()"
        [status]="cargando() ? 'loading' : medicos().length > 0 ? 'success' : 'empty'"
        pagination="client"
      >
        <ng-template #actions let-ctx>
          <app-action-group [compact]="true" [actions]="rowActions" (actionClick)="onRowAction($event, ctx)"></app-action-group>
        </ng-template>
      </app-data-table>
    </div>

    <app-nuevo-medico [(opened)]="mostrarNuevo" (registrado)="cargar()" />
    <app-editar-medico [(opened)]="mostrarEditar" [medico]="medicoSeleccionado()" (actualizado)="cargar()" />
  `
})
export class MedicosComponent implements OnInit {
  private readonly api = inject(MedicosApiService);

  protected readonly mostrarNuevo = signal(false);
  protected readonly mostrarEditar = signal(false);
  protected readonly medicoSeleccionado = signal<MedicoResumen | null>(null);
  protected readonly cargando = signal(false);
  protected readonly medicos = signal<MedicoResumen[]>([]);
  protected filtro = '';

  readonly columnas: readonly DataTableColumn<MedicoResumen>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'nombres', header: 'Nombres', sortable: true },
    { key: 'apellidos', header: 'Apellidos', sortable: true },
    { key: 'numeroColegiatura', header: 'CMP', sortable: true },
    { key: 'especialidad', header: 'Especialidad', sortable: true },
    { key: 'telefono', header: 'Telefono', sortable: true },
    { key: 'correo', header: 'Correo', sortable: true }
  ];

  readonly rowActions: ActionItem[] = [
    { id: 'edit', icon: 'fa-solid fa-pen', label: 'Editar', variant: 'primary' },
    { id: 'delete', icon: 'fa-solid fa-trash', label: 'Eliminar', variant: 'danger' }
  ];

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando.set(true);
    this.api.obtenerTodos(1, 50, this.filtro || undefined).subscribe({
      next: (res: any) => { this.medicos.set(res.value?.data || []); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  onRowAction(actionId: string, row: MedicoResumen) {
    if (actionId === 'edit') {
      this.medicoSeleccionado.set(row);
      this.mostrarEditar.set(true);
    } else if (actionId === 'delete') {
      if (confirm('Seguro que desea eliminar al medico ' + row.nombres + '?')) {
        this.api.eliminar(row.id).subscribe(() => this.cargar());
      }
    }
  }
}
