import { ChangeDetectionStrategy, Component, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MedicosApiService, ActualizarMedicoDto, MedicoResumen } from '../../core/api/medicos-api.service';
import { InputComponent, ButtonComponent, FormDialog, FormDialogActions } from '../../shared/ui';

@Component({
  selector: 'app-editar-medico',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, InputComponent, ButtonComponent, FormDialog, FormDialogActions],
  template: `
    <app-form-dialog title="Editar medico" size="md" [(opened)]="opened" (closed)="cancelar()">
      <form (ngSubmit)="actualizar()">
        <app-input type="text" label="Nombres" [(ngModel)]="form.nombres" name="nombres"></app-input>
        <app-input type="text" label="Apellidos" [(ngModel)]="form.apellidos" name="apellidos"></app-input>
        <app-input type="text" label="Nro Colegiatura (CMP)" [(ngModel)]="form.numeroColegiatura" name="colegiatura"></app-input>
        <app-input type="text" label="Especialidad" [(ngModel)]="form.especialidad" name="especialidad"></app-input>
        <app-input type="tel" label="Telefono" [(ngModel)]="form.telefono" name="telefono"></app-input>
        <app-input type="email" label="Correo" [(ngModel)]="form.correo" name="correo"></app-input>

        @if (error()) { <p class="error" style="color: var(--danger-color)">{{ error() }}</p> }

        <app-form-dialog-actions>
          <app-button type="button" variant="outline" (buttonClick)="cancelar()">Cancelar</app-button>
          <app-button type="submit" [loading]="enviando()">Guardar Cambios</app-button>
        </app-form-dialog-actions>
      </form>
    </app-form-dialog>
  `
})
export class EditarMedicoComponent {
  private readonly api = inject(MedicosApiService);
  readonly opened = model(false);
  readonly medico = input<MedicoResumen | null>(null);
  readonly actualizado = output<void>();
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected form = { id: 0, nombres: '', apellidos: '', numeroColegiatura: '', especialidad: '', telefono: '', correo: '' };

  constructor() {
    effect(() => {
      const m = this.medico();
      if (m && this.opened()) {
        this.form = { id: m.id, nombres: m.nombres, apellidos: m.apellidos, numeroColegiatura: m.numeroColegiatura, especialidad: m.especialidad, telefono: m.telefono || '', correo: m.correo || '' };
        this.error.set(null);
      }
    });
  }

  actualizar(): void {
    if (!this.form.id) return;
    this.enviando.set(true);
    this.error.set(null);
    const dto: ActualizarMedicoDto = { ...this.form };
    this.api.actualizar(dto).subscribe({
      next: () => { this.enviando.set(false); this.opened.set(false); this.actualizado.emit(); },
      error: (err: any) => { this.error.set(err.error?.detailError || err.error?.title || 'Error al actualizar.'); this.enviando.set(false); }
    });
  }

  cancelar(): void { this.opened.set(false); }
}
