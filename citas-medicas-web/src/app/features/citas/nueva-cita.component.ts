import { ChangeDetectionStrategy, Component, inject, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CitasApiService, RegistrarCitaDto } from '../../core/api/citas-api.service';
import { PacientesApiService, PacienteResumen } from '../../core/api/pacientes-api.service';
import { InputComponent, ButtonComponent, TextareaComponent, FormDialog, FormDialogActions } from '../../shared/ui';

@Component({
  selector: 'app-nueva-cita',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, InputComponent, ButtonComponent, TextareaComponent, FormDialog, FormDialogActions],
  template: `
    <app-form-dialog
      title="Registrar cita"
      size="md"
      [(opened)]="opened"
      (closed)="cancelar()"
    >
      <form (ngSubmit)="registrar()">

        <!-- Paciente: busqueda por DNI -->
        <div style="display: flex; gap: 8px; margin-bottom: 16px;">
          <div style="flex: 1;">
            <app-input
              type="text"
              label="DNI Paciente"
              [(ngModel)]="dniBusqueda"
              name="dniBusqueda"
            ></app-input>
          </div>
          <div class="form-group" style="display: flex; flex-direction: column; gap: 4px;">
            <label class="form-label">&nbsp;</label>
            <app-button type="button" variant="outline" (buttonClick)="buscarPaciente()" [loading]="buscandoPaciente()">Buscar</app-button>
          </div>
        </div>
        
        @if (pacienteEncontrado()) {
          <div style="padding: 8px; background: var(--surface-hover); border-radius: 4px; margin-bottom: 16px;">
            <strong>Paciente:</strong> {{ pacienteEncontrado()?.nombres }} {{ pacienteEncontrado()?.apellidos }}
            <br/><small>ID: {{ pacienteEncontrado()?.id }}</small>
          </div>
        }

        <!-- Medico (servicio) -->
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">Medico / Servicio</label>
          <select class="form-input" [(ngModel)]="form.idMedico" name="idMedico">
            <option [ngValue]="1">Medicina General</option>
            <option [ngValue]="2">Pediatria</option>
            <option [ngValue]="3">Cardiologia</option>
            <option [ngValue]="4">Neurologia</option>
          </select>
        </div>

        <!-- Fecha y hora -->
        <app-input
          type="datetime-local"
          label="Fecha y hora"
          [(ngModel)]="form.fechaHoraLocal"
          name="fechaHora"
        ></app-input>

        <!-- Estado -->
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">Estado</label>
          <select class="form-input" [(ngModel)]="form.estado" name="estado">
            <option value="PROGRAMADA">Programada</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="EN_ATENCION">En atencion</option>
            <option value="ATENDIDA">Atendida</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>

        <!-- Motivo -->
        <app-textarea
          label="Motivo"
          [(ngModel)]="form.motivo"
          name="motivo"
        ></app-textarea>

        <!-- Diagnostico -->
        <app-input
          type="text"
          label="Diagnostico"
          [(ngModel)]="form.diagnostico"
          name="diagnostico"
        ></app-input>

        <!-- Tratamiento -->
        <app-input
          type="text"
          label="Tratamiento"
          [(ngModel)]="form.tratamiento"
          name="tratamiento"
        ></app-input>

        @if (error()) { <p class="error" style="color: var(--danger-color)">{{ error() }}</p> }

        <app-form-dialog-actions>
          <app-button type="button" variant="outline" (buttonClick)="cancelar()">
            Cancelar
          </app-button>
          <app-button type="submit" [loading]="enviando()" [disabled]="!pacienteEncontrado()">
            Guardar
          </app-button>
        </app-form-dialog-actions>
      </form>
    </app-form-dialog>
  `
})
export class NuevaCitaComponent {
  private readonly api = inject(CitasApiService);
  private readonly pacientesApi = inject(PacientesApiService);

  readonly opened = model(false);
  readonly registrado = output<void>();

  protected readonly enviando = signal(false);
  protected readonly buscandoPaciente = signal(false);
  protected readonly error = signal<string | null>(null);

  protected dniBusqueda = '';
  protected readonly pacienteEncontrado = signal<PacienteResumen | null>(null);

  protected form = {
    idMedico: 1,
    fechaHoraLocal: '',
    estado: 'PROGRAMADA',
    motivo: '',
    diagnostico: '',
    tratamiento: ''
  };

  buscarPaciente() {
    if (!this.dniBusqueda) return;
    this.buscandoPaciente.set(true);
    this.error.set(null);
    this.pacientesApi.obtenerTodos(1, 5, this.dniBusqueda).subscribe({
      next: (res: any) => {
        this.buscandoPaciente.set(false);
        const docs = res.value?.data || [];
        const pac = docs.find((p: any) => p.numeroDocumento === this.dniBusqueda);
        if (pac) {
          this.pacienteEncontrado.set(pac);
        } else {
          this.error.set('No se encontro ningun paciente con ese DNI.');
          this.pacienteEncontrado.set(null);
        }
      },
      error: () => {
        this.buscandoPaciente.set(false);
        this.error.set('Error al buscar paciente.');
      }
    });
  }

  registrar(): void {
    if (!this.pacienteEncontrado()) {
      this.error.set('Debe buscar y seleccionar un paciente.');
      return;
    }
    if (!this.form.motivo?.trim()) {
      this.error.set('El motivo es obligatorio.');
      return;
    }
    if (!this.form.fechaHoraLocal) {
      this.error.set('La fecha y hora son obligatorias.');
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    const dto: RegistrarCitaDto = {
      idPaciente: this.pacienteEncontrado()!.id,
      idMedico: this.form.idMedico,
      fechaHora: new Date(this.form.fechaHoraLocal).toISOString(),
      motivo: this.form.motivo,
      estado: this.form.estado,
      diagnostico: this.form.diagnostico || undefined,
      tratamiento: this.form.tratamiento || undefined,
      idIdempotencia: crypto.randomUUID()
    };
    this.api.registrar(dto).subscribe({
      next: () => {
        this.enviando.set(false);
        this.opened.set(false);
        this.registrado.emit();
      },
      error: (err: any) => {
        console.error('Error al registrar:', err);
        let msg = 'Error al registrar la cita.';
        if (err.error?.detailError) {
          msg = typeof err.error.detailError === 'string' ? err.error.detailError : JSON.stringify(err.error.detailError);
        } else if (err.error?.title) {
          msg = err.error.title;
        } else if (err.error?.message) {
          msg = err.error.message;
        }
        this.error.set(msg);
        this.enviando.set(false);
      },
    });
  }

  cancelar(): void {
    this.opened.set(false);
  }
}
