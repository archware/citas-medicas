import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent, StatusBadgeStatus } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('renders every state with visible text in addition to color', () => {
    const expected: Readonly<Record<StatusBadgeStatus, string>> = {
      active: 'Activo',
      inactive: 'Inactivo',
      degraded: 'Con incidencias',
      unconfigured: 'Sin configurar',
      info: 'Informativo',
      success: 'Correcto',
      warning: 'Advertencia',
      danger: 'Crítico',
    };

    for (const [status, label] of Object.entries(expected)) {
      fixture.componentRef.setInput('status', status as StatusBadgeStatus);
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector('.status-badge') as HTMLElement;
      expect(badge.classList).toContain(`status-badge--${status}`);
      expect(badge.textContent).toContain(label);
      expect(badge.getAttribute('aria-label')).toBe(label);
    }
  });

  it('exposes an explicit critical state without relying on color alone', () => {
    fixture.componentRef.setInput('status', 'danger');
    fixture.componentRef.setInput('label', 'Cuota vencida');
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.status-badge') as HTMLElement;
    expect(badge.classList).toContain('status-badge--danger');
    expect(badge.textContent).toContain('Cuota vencida');
    expect(badge.getAttribute('aria-label')).toBe('Cuota vencida');
  });

  it('exposes an informational state for neutral in-progress domain labels', () => {
    fixture.componentRef.setInput('status', 'info');
    fixture.componentRef.setInput('label', 'Parcial');
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.status-badge') as HTMLElement;
    expect(badge.classList).toContain('status-badge--info');
    expect(badge.textContent).toContain('Parcial');
    expect(badge.getAttribute('aria-label')).toBe('Parcial');
  });

  it('adds an accessible, secret-free visual identity for Telegram', () => {
    component.channel = 'telegram';
    component.status = 'active';
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.status-badge') as HTMLElement;
    const icon = badge.querySelector('i') as HTMLElement;

    expect(badge.textContent).toContain('TELEGRAM');
    expect(badge.textContent).toContain('Activo');
    expect(badge.getAttribute('aria-label')).toBe('TELEGRAM: Activo');
    expect(icon.classList).toContain('fa-brands');
    expect(icon.classList).toContain('fa-telegram');
  });

  it('supports WEB and SMS without announcing static content by default', () => {
    fixture.componentRef.setInput('channel', 'sms');
    fixture.detectChanges();
    let badge = fixture.nativeElement.querySelector('.status-badge') as HTMLElement;
    expect(badge.getAttribute('aria-label')).toContain('SMS');
    expect(badge.getAttribute('role')).toBeNull();

    fixture.componentRef.setInput('channel', 'web');
    fixture.componentRef.setInput('announce', true);
    fixture.detectChanges();
    badge = fixture.nativeElement.querySelector('.status-badge') as HTMLElement;
    expect(badge.getAttribute('aria-label')).toContain('WEB');
    expect(badge.getAttribute('role')).toBe('status');
    expect(badge.getAttribute('aria-live')).toBe('polite');
  });

  it('allows an explicit visible label and accessible name', () => {
    component.status = 'degraded';
    component.label = 'Entrega parcial';
    component.ariaLabel = 'Canal SMS con entrega parcial';
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.status-badge') as HTMLElement;
    expect(badge.textContent).toContain('Entrega parcial');
    expect(badge.getAttribute('aria-label')).toBe('Canal SMS con entrega parcial');
  });
});
