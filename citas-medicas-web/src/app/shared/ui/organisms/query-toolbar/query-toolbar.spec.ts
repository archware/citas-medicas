import { TestBed } from '@angular/core/testing';
import { QueryToolbar } from './query-toolbar';

describe('QueryToolbar', () => {
  it('publica un grupo de filtros y acciones con etiqueta accesible', async () => {
    await TestBed.configureTestingModule({ imports: [QueryToolbar] }).compileComponents();
    const fixture = TestBed.createComponent(QueryToolbar);
    fixture.componentRef.setInput('accessibleLabel', 'Buscar clientes y crear registros');
    fixture.detectChanges();

    const toolbar = fixture.nativeElement.querySelector('section') as HTMLElement;
    expect(toolbar.getAttribute('role')).toBe('group');
    expect(toolbar.getAttribute('aria-label')).toBe('Buscar clientes y crear registros');
  });

  it('combina densidad y disposicion como ejes independientes', async () => {
    await TestBed.configureTestingModule({ imports: [QueryToolbar] }).compileComponents();
    const fixture = TestBed.createComponent(QueryToolbar);
    fixture.componentRef.setInput('density', 'compact');
    fixture.componentRef.setInput('layout', 'stacked');
    fixture.detectChanges();

    const toolbar = fixture.nativeElement.querySelector('section') as HTMLElement;
    expect(toolbar.classList).toContain('query-toolbar--compact');
    expect(toolbar.classList).toContain('query-toolbar--stacked');
  });
});
