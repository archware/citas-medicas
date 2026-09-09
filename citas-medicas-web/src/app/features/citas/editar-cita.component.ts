import { ChangeDetectionStrategy, Component, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CitasApiService, ActualizarCitaDto, CitaResumen } from '../../core/api/citas-api.service';
import { InputComponent, ButtonComponent, FormDialog, FormDialogActions } from '../../shared/ui';

@Component({
  selector: 'app-editar-cita',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, InputComponent, ButtonComponent, FormDialog, FormDialogActions],
  template: `
    <app-form-dialog
      title="Editar cita"
      size="md"
      [(opened)]="opened"
      (closed)="cancelar()"
    >
      <form (ngSubmit)="actualizar()">
        <div style="margin-bottom: 16px;">
          <strong>ID:</strong> {{ cita()?.id }} <br/>
          <strong>Paciente:</strong> {{ cita()?.nombrePaciente }} <br/>
          <strong>Medico:</strong> {{ cita()?.nombreMedico }}
        </div>

        <app-input
          type="datetime-local"
          label="Fecha y hora"
          [(ngModel)]="form.fechaHora"
          name="fechaHora"
        ></app-input>

        <!-- Estado (enumerador) -->
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

        <app-input
          type="text"
          label="Motivo"
          [(ngModel)]="form.motivo"
          name="motivo"
        ></app-input>

        <app-input
          type="text"
          label="Diagnostico"
          [(ngModel)]="form.diagnostico"
          name="diagnostico"
        ></app-input>

        <app-input
          type="text"
          label="Tratamiento"
          [(ngModel)]="form.tratamiento"
          name="tratamiento"
        ></app-input>

        @if (error()) { <p class="error" style="color: var(--danger-color)">{{ error() }}</p> }

        <app-form-dialog-actions>
          <app-button type="button" variant="outline" (buttonClick)="cancelar()">Cancelar</app-button>
          <app-button type="submit" [loading]="enviando()">Guardar Cambios</app-button>
        </app-form-dialog-actions>
      </form>
    </app-form-dialog>
  `
})
export class EditarCitaComponent {
  private readonly api = inject(CitasApiService);

  readonly opened = model(false);
  readonly cita = input<CitaResumen | null>(null);
  readonly actualizado = output<void>();

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected form = { 
    id: 0, fechaHora: '', estado: 'PROGRAMADA', motivo: '', diagnostico: '', tratamiento: ''
  };

  constructor() {
    effect(() => {
      const c = this.cita();
      if (c && this.opened()) {
        this.form = {
          id: c.id,
          fechaHora: c.fechaHora ? c.fechaHora.substring(0, 16) : '',
          estado: c.estado || 'PROGRAMADA',
          motivo: c.motivo || '',
          diagnostico: c.diagnostico || '',
          tratamiento: c.tratamiento || ''
        };
        this.error.set(null);
      }
    });
  }

  actualizar(): void {
    if (!this.form.id) return;
    if (!this.form.motivo?.trim()) {
      this.error.set('El motivo es obligatorio.');
      return;
    }
    if (!this.form.fechaHora) {
      this.error.set('La fecha y hora son obligatorias.');
      return;
    }
    this.enviando.set(true);
    this.error.set(null);

    const dto: ActualizarCitaDto = {
      id: this.form.id,
      fechaHora: new Date(this.form.fechaHora).toISOString(),
      motivo: this.form.motivo,
      estado: this.form.estado,
      diagnostico: this.form.diagnostico,
      tratamiento: this.form.tratamiento
    };
    
    this.api.actualizar(dto).subscribe({
      next: () => {
        this.enviando.set(false);
        this.opened.set(false);
        this.actualizado.emit();
      },
      error: (err: any) => { 
        const msg = err.error?.detalleErrorCitaMedica || err.error?.title || err.error?.message || 'Error al actualizar la cita.';
        this.error.set(typeof msg === 'string' ? msg : JSON.stringify(msg)); 
        this.enviando.set(false); 
      },
    });
  }

  cancelar(): void { 
    this.opened.set(false);
  }
}

