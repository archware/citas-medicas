// SKIP jsdom: specs del ADN que miden layout/roles reales de navegador (o esperan clases retiradas en 5.7.4). Ver docs/ATOMIC_DECISION_5.7.md.
import { TestBed } from '@angular/core/testing';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ToastComponent] }).compileComponents();
  });

  it.skip('promueve una notificación a la capa superior aunque exista un diálogo modal', async () => {
    const dialog = document.createElement('dialog');
    document.body.append(dialog);
    dialog.showModal();

    const fixture = TestBed.createComponent(ToastComponent);
    fixture.detectChanges();
    TestBed.inject(ToastService).success('Operación confirmada.', 0);
    await fixture.whenStable();

    expect(fixture.nativeElement.getAttribute('popover')).toBe('manual');
    expect(fixture.nativeElement.matches(':popover-open')).toBe(true);

    dialog.close();
    dialog.remove();
  });

  it('retira la región de la capa superior al limpiar las notificaciones', async () => {
    const fixture = TestBed.createComponent(ToastComponent);
    const service = TestBed.inject(ToastService);
    fixture.detectChanges();
    service.error('No fue posible completar la operación.', 0);
    await fixture.whenStable();

    service.clear();
    await fixture.whenStable();

    expect(fixture.nativeElement.matches(':popover-open')).toBe(false);
  });
});
