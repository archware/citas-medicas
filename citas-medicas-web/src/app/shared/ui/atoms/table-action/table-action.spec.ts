import { TestBed } from '@angular/core/testing';
import { TableAction } from './table-action';

describe('TableAction', () => {
  it('presenta la acción de consulta con color informativo cuando está habilitada', async () => {
    await TestBed.configureTestingModule({ imports: [TableAction] }).compileComponents();
    const fixture = TestBed.createComponent(TableAction);
    fixture.componentRef.setInput('label', 'Ver detalle');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.classList).toContain('table-action--info');
    expect(button.disabled).toBe(false);
  });

  it('mantiene las tres variantes de tamaño y un nombre accesible', async () => {
    await TestBed.configureTestingModule({ imports: [TableAction] }).compileComponents();
    const fixture = TestBed.createComponent(TableAction);
    fixture.componentRef.setInput('label', 'Editar registro');
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Editar registro');
    expect(button.classList).toContain('table-action--lg');
  });

  it('normaliza iconClass sin reemplazarlo por los tres puntos de custom', async () => {
    await TestBed.configureTestingModule({ imports: [TableAction] }).compileComponents();
    const fixture = TestBed.createComponent(TableAction);
    fixture.componentRef.setInput('action', 'custom');
    fixture.componentRef.setInput('label', 'Imprimir comprobante');
    fixture.componentRef.setInput('iconClass', 'print');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('i') as HTMLElement;
    expect(icon.classList).toContain('fa-solid');
    expect(icon.classList).toContain('fa-print');
    expect(icon.classList).not.toContain('fa-ellipsis');
  });

  it('publica iconos semanticos para imprimir, revertir, canales y contrasena', async () => {
    await TestBed.configureTestingModule({ imports: [TableAction] }).compileComponents();
    const cases = [
      ['print', 'fa-print'],
      ['reverse', 'fa-rotate-left'],
      ['channels', 'fa-mobile-screen-button'],
      ['reset-password', 'fa-key'],
    ] as const;

    for (const [action, expectedIcon] of cases) {
      const fixture = TestBed.createComponent(TableAction);
      fixture.componentRef.setInput('action', action);
      fixture.componentRef.setInput('label', action);
      fixture.detectChanges();
      expect((fixture.nativeElement.querySelector('i') as HTMLElement).classList).toContain(
        expectedIcon,
      );
      fixture.destroy();
    }
  });
});
