import { ChangeDetectionStrategy, Component, inject, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PacientesApiService, RegistrarPacienteDto } from '../../core/api/pacientes-api.service';
import { InputComponent, ButtonComponent, FormDialog, FormDialogActions } from '../../shared/ui';

@Component({
  selector: 'app-nuevo-paciente',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, InputComponent, ButtonComponent, FormDialog, FormDialogActions],
  template: `
    <app-form-dialog
      title="Registrar paciente"
      size="md"
      [(opened)]="opened"
      (closed)="cancelar()"
    >
      <form (ngSubmit)="registrar()">
        <app-input type="text" label="Nro Documento" [(ngModel)]="form.numeroDocumento" name="numeroDocumento"></app-input>
        <app-input type="text" label="Nombres" [(ngModel)]="form.nombres" name="nombres"></app-input>
        <app-input type="text" label="Apellidos" [(ngModel)]="form.apellidos" name="apellidos"></app-input>
        <app-input type="date" label="Fecha de Nacimiento" [(ngModel)]="form.fechaNacimientoLocal" name="fechaNacimiento"></app-input>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">GÃ©nero</label>
          <select class="form-input" [(ngModel)]="form.genero" name="genero">
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>

        <app-input type="text" label="DirecciÃ³n" [(ngModel)]="form.direccion" name="direccion"></app-input>
        <app-input type="tel" label="TelÃ©fono" [(ngModel)]="form.telefono" name="telefono"></app-input>
        <app-input type="email" label="Correo" [(ngModel)]="form.correo" name="correo"></app-input>

        @if (error()) { <p class="error" style="color: var(--danger-color)">{{ error() }}</p> }

        <app-form-dialog-actions>
          <app-button type="button" variant="outline" (buttonClick)="cancelar()">Cancelar</app-button>
          <app-button type="submit" [loading]="enviando()">Guardar</app-button>
        </app-form-dialog-actions>
      </form>
    </app-form-dialog>
  `
})
export class NuevoPacienteComponent {
  private readonly api = inject(PacientesApiService);

  readonly opened = model(false);
  readonly registrado = output<void>();

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected form = { 
    numeroDocumento: '', nombres: '', apellidos: '', fechaNacimientoLocal: '', genero: 'M', direccion: '', telefono: '', correo: ''
  };

  registrar(): void {
    this.enviando.set(true);
    this.error.set(null);
    const dto: RegistrarPacienteDto = {
      numeroDocumento: this.form.numeroDocumento,
      nombres: this.form.nombres,
      apellidos: this.form.apellidos,
      fechaNacimiento: this.form.fechaNacimientoLocal ? new Date(this.form.fechaNacimientoLocal).toISOString() : new Date().toISOString(),
      genero: this.form.genero,
      direccion: this.form.direccion,
      telefono: this.form.telefono,
      correo: this.form.correo
    };
    
    this.api.registrar(dto).subscribe({
      next: () => {
        this.enviando.set(false);
        this.opened.set(false);
        this.registrado.emit();
      },
      error: (err: any) => { 
        const msg = err.error?.detalleErrorCitaMedica || err.error?.title || 'Error al registrar.';
        this.error.set(msg); 
        this.enviando.set(false); 
      },
    });
  }

  cancelar(): void { 
    this.opened.set(false);
  }
}

