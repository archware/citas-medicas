import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Alert } from './alert.component';

describe('Alert', () => {
  let fixture: ComponentFixture<Alert>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Alert],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Alert);
  });

  it('aplica la clase semantica del kind y muestra el titulo', async () => {
    fixture.componentRef.setInput('kind', 'warning');
    fixture.componentRef.setInput('title', 'Atención');
    await fixture.whenStable();

    const alert = fixture.nativeElement.querySelector('.alert') as HTMLElement;
    expect(alert.classList).toContain('alert--warning');
    expect(fixture.nativeElement.querySelector('.alert__title')?.textContent?.trim()).toBe(
      'Atención',
    );
  });

  it('traslada el espaciado de flujo al host, no al elemento interno', async () => {
    fixture.componentRef.setInput('spacing', 'compact');
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).classList).toContain('alert-flow--compact');

    fixture.componentRef.setInput('spacing', 'none');
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).classList).toContain('alert-flow--none');
  });

  // `role="alert"` implica `aria-live="assertive"`. La implementacion anterior lo
  // fijaba para los cuatro kinds y luego lo sobrescribia con `polite`: una
  // combinacion contradictoria que cada lector de pantalla resuelve distinto.
  it('reserva la interrupcion del lector de pantalla para el kind danger', async () => {
    fixture.componentRef.setInput('kind', 'info');
    await fixture.whenStable();
    let alert = fixture.nativeElement.querySelector('.alert') as HTMLElement;
    expect(alert.getAttribute('role')).toBe('status');
    expect(alert.getAttribute('aria-live')).toBe('polite');

    fixture.componentRef.setInput('kind', 'danger');
    await fixture.whenStable();
    alert = fixture.nativeElement.querySelector('.alert') as HTMLElement;
    expect(alert.getAttribute('role')).toBe('alert');
    expect(alert.getAttribute('aria-live')).toBe('assertive');
  });

  // Con `provideZonelessChangeDetection`, la implementacion anterior escribia un
  // campo plano al cerrar y no agendaba deteccion: la alerta emitia el evento
  // pero no llegaba a desaparecer de la pantalla.
  it('emite closed y desaparece de verdad en modo zoneless', async () => {
    fixture.componentRef.setInput('closable', true);
    let closedCount = 0;
    fixture.componentInstance.closed.subscribe(() => (closedCount += 1));
    await fixture.whenStable();

    (fixture.nativeElement.querySelector('.alert__close') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(closedCount).toBe(1);
    expect(fixture.nativeElement.querySelector('.alert')).toBeNull();
  });
});
