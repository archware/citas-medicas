import { TestBed } from '@angular/core/testing';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  it('relaciona el encabezado con un titulo unico y expone el contexto', async () => {
    await TestBed.configureTestingModule({ imports: [PageHeader] }).compileComponents();
    const fixture = TestBed.createComponent(PageHeader);
    fixture.componentRef.setInput('eyebrow', 'Catálogos');
    fixture.componentRef.setInput('title', 'Tipos de crédito');
    fixture.componentRef.setInput('subtitle', 'Administre las opciones disponibles.');
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('header') as HTMLElement;
    const title = fixture.nativeElement.querySelector('h1') as HTMLElement;

    expect(title.textContent).toContain('Tipos de crédito');
    expect(header.getAttribute('aria-labelledby')).toBe(title.id);
    expect(fixture.nativeElement.textContent).toContain('Administre las opciones disponibles.');
  });

  it('aplica solo densidades declaradas por el contrato', async () => {
    await TestBed.configureTestingModule({ imports: [PageHeader] }).compileComponents();
    const fixture = TestBed.createComponent(PageHeader);
    fixture.componentRef.setInput('title', 'Clientes');
    fixture.componentRef.setInput('density', 'compact');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('header').classList).toContain(
      'page-header--compact',
    );
  });
});
