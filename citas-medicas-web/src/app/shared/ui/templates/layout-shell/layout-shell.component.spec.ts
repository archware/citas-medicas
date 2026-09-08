// SKIP jsdom: specs del ADN que miden layout/roles reales de navegador (o esperan clases retiradas en 5.7.4). Ver docs/ATOMIC_DECISION_5.7.md.
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LayoutShellComponent } from './layout-shell.component';

describe('LayoutShellComponent', () => {
  it.skip('reserva el scroll principal al overlay y evita un segundo dueño en el sidebar', async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutShellComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(LayoutShellComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const sidebar = fixture.nativeElement.querySelector('.layout-sidebar') as HTMLElement;
    const contentOverlay = fixture.nativeElement.querySelector(
      '.layout-content > app-scroll-overlay',
    ) as HTMLElement;

    expect(getComputedStyle(sidebar).overflow).toBe('hidden');
    expect(contentOverlay).not.toBeNull();
    const viewport = contentOverlay.querySelector('.scroll-overlay__viewport') as HTMLElement;
    expect(viewport).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.scroll-overlay__viewport').length).toBe(1);
  });
});
