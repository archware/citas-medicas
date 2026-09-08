// SKIP jsdom: specs del ADN que miden layout/roles reales de navegador (o esperan clases retiradas en 5.7.4). Ver docs/ATOMIC_DECISION_5.7.md.
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiMetric, MetricsGridComponent } from './metrics-grid.component';

describe('MetricsGridComponent', () => {
  let component: MetricsGridComponent;
  let fixture: ComponentFixture<MetricsGridComponent>;

  const metrics: readonly KpiMetric[] = [
    { id: 'income', title: 'Ingresos', value: 120, displayValue: 'S/ 120.00' },
    { id: 'expense', title: 'Egresos', value: 40, displayValue: 'S/ 40.00' },
  ];

  const responsiveCapacity = (): number => {
    const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    return window.innerWidth <= 36 * rootFontSize
      ? 1
      : window.innerWidth <= 72 * rootFontSize
        ? 2
        : 4;
  };

  const visibleColumns = (grid: HTMLElement): string[] =>
    getComputedStyle(grid)
      .gridTemplateColumns.split(' ')
      .filter((column) => Number.parseFloat(column) > 0);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricsGridComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricsGridComponent);
    component = fixture.componentInstance;
  });

  it.skip('renders the supplied metrics and exposes an accessible section name', () => {
    component.metrics = metrics;
    component.ariaLabel = 'Indicadores financieros';
    fixture.detectChanges();

    const grid = fixture.nativeElement.querySelector('.metrics-grid') as HTMLElement;
    const cards = fixture.nativeElement.querySelectorAll('app-kpi-card');

    expect(grid.getAttribute('aria-label')).toBe('Indicadores financieros');
    expect(cards.length).toBe(2);
    expect(grid.style.getPropertyValue('--min-col-width')).toBe('13.75rem');
    const columns = visibleColumns(grid);
    expect(columns).toHaveLength(Math.min(2, responsiveCapacity()));
    if (columns.length === 2) {
      expect(Number.parseFloat(columns[0])).toBeCloseTo(Number.parseFloat(columns[1]), 0);
    }
  });

  it.skip('uses the supplied minimum width without reserving empty metric columns', () => {
    component.metrics = [...metrics, { id: 'balance', title: 'Saldo', value: 80 }];
    component.minCardWidth = '11rem';
    fixture.detectChanges();

    const grid = fixture.nativeElement.querySelector('.metrics-grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--min-col-width')).toBe('11rem');
    expect(grid.style.getPropertyValue('--metric-columns-desktop')).toBe('3');
    expect(grid.style.getPropertyValue('--metric-columns-tablet')).toBe('2');
    expect(grid.style.getPropertyValue('--metric-columns-mobile')).toBe('1');

    expect(visibleColumns(grid)).toHaveLength(Math.min(3, responsiveCapacity()));
    expect(fixture.nativeElement.querySelectorAll('app-kpi-card')).toHaveLength(3);
  });

  it('caps columns at four on desktop, two on tablet, and one on mobile', () => {
    component.metrics = Array.from({ length: 6 }, (_, index) => ({
      id: `metric-${index}`,
      title: `Métrica ${index + 1}`,
      value: index + 1,
    }));
    fixture.detectChanges();

    const grid = fixture.nativeElement.querySelector('.metrics-grid') as HTMLElement;
    expect(component.columnCount(4)).toBe(4);
    expect(component.columnCount(2)).toBe(2);
    expect(component.columnCount(1)).toBe(1);
    expect(grid.style.getPropertyValue('--metric-columns-desktop')).toBe('4');
    expect(grid.style.getPropertyValue('--metric-columns-tablet')).toBe('2');
    expect(grid.style.getPropertyValue('--metric-columns-mobile')).toBe('1');
    expect(fixture.nativeElement.querySelectorAll('app-kpi-card')).toHaveLength(6);
  });

  it('does not create a grid track when there are no metrics', () => {
    fixture.detectChanges();

    const grid = fixture.nativeElement.querySelector('.metrics-grid') as HTMLElement;
    expect(grid.classList.contains('metrics-grid--empty')).toBe(true);
    expect(component.columnCount(4)).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('app-kpi-card')).toHaveLength(0);
  });

  it('tracks cards by stable id when their order changes', () => {
    fixture.componentRef.setInput('metrics', metrics);
    fixture.detectChanges();
    const before = Array.from(
      fixture.nativeElement.querySelectorAll('app-kpi-card'),
    ) as HTMLElement[];

    fixture.componentRef.setInput('metrics', [metrics[1], metrics[0]]);
    fixture.detectChanges();
    const after = Array.from(
      fixture.nativeElement.querySelectorAll('app-kpi-card'),
    ) as HTMLElement[];

    expect(after[0]).toBe(before[1]);
    expect(after[1]).toBe(before[0]);
  });

  it('passes authoritative display values and omits absent trends', () => {
    fixture.componentRef.setInput('metrics', metrics);
    fixture.detectChanges();

    const firstCard = fixture.nativeElement.querySelector('app-kpi-card') as HTMLElement;
    expect(firstCard.querySelector('.kpi-card__value')?.textContent?.trim()).toBe('S/ 120.00');
    expect(firstCard.querySelector('.kpi-card__trend')).toBeNull();
  });
});
