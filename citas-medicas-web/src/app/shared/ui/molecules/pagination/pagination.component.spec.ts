import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    component.total = 50;
    component.pageSize = 10;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── totalPages computed ───────────────────────────────────────────────────
  describe('totalPages', () => {
    it('should compute correct total pages', () => {
      expect(component.totalPages()).toBe(5);
    });

    it('should return 1 when total is 0', () => {
      component.total = 0;
      expect(component.totalPages()).toBe(1);
    });

    it('should round up for partial last page', () => {
      component.total = 11;
      component.pageSize = 10;
      expect(component.totalPages()).toBe(2);
    });

    it('should handle pageSize > total', () => {
      component.total = 5;
      component.pageSize = 10;
      expect(component.totalPages()).toBe(1);
    });
  });

  // ── Navigation buttons ────────────────────────────────────────────────────
  describe('navigation buttons', () => {
    it('should disable prev button on page 1', () => {
      component.page = 1;
      fixture.detectChanges();
      const prevBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.page-prev');
      expect(prevBtn.disabled).toBe(true);
    });

    it('should enable prev button on page > 1', () => {
      component.page = 2;
      fixture.detectChanges();
      const prevBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.page-prev');
      expect(prevBtn.disabled).toBe(false);
    });

    it('should disable next button on last page', () => {
      component.page = 5;
      fixture.detectChanges();
      const nextBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.page-next');
      expect(nextBtn.disabled).toBe(true);
    });

    it('should enable next button when not on last page', () => {
      component.page = 3;
      fixture.detectChanges();
      const nextBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.page-next');
      expect(nextBtn.disabled).toBe(false);
    });
  });

  // ── goToPage & pageChange ─────────────────────────────────────────────────
  describe('goToPage', () => {
    it('should emit pageChange with the target page number', () => {
      let emittedPage: number | undefined;
      component.pageChange.subscribe((p) => { emittedPage = p; });

      component.goToPage(3);

      expect(emittedPage).toBe(3);
      expect(component.currentPage()).toBe(3);
    });

    it('should NOT emit pageChange for the current page', () => {
      component.page = 2;
      let emittedCount = 0;
      component.pageChange.subscribe(() => { emittedCount++; });

      component.goToPage(2);

      expect(emittedCount).toBe(0);
    });

    it('should NOT emit pageChange for page 0 (out of range)', () => {
      let emittedCount = 0;
      component.pageChange.subscribe(() => { emittedCount++; });

      component.goToPage(0);

      expect(emittedCount).toBe(0);
    });

    it('should NOT emit pageChange for page > totalPages', () => {
      let emittedCount = 0;
      component.pageChange.subscribe(() => { emittedCount++; });

      component.goToPage(99);

      expect(emittedCount).toBe(0);
    });
  });

  // ── visiblePages ──────────────────────────────────────────────────────────
  describe('visiblePages', () => {
    it('should show all pages when total pages <= maxVisible', () => {
      component.total = 30;
      component.pageSize = 10;
      component.maxVisible = 5;
      fixture.detectChanges();

      const pages = component.visiblePages().filter((p) => p !== '...');
      expect(pages).toEqual([1, 2, 3]);
    });

    it('should include ellipsis when pages exceed maxVisible', () => {
      component.total = 100;
      component.pageSize = 10;
      component.maxVisible = 5;
      component.page = 1;
      fixture.detectChanges();

      expect(component.visiblePages()).toContain('...');
    });

    it('should always include page 1 and last page', () => {
      component.total = 100;
      component.pageSize = 10;
      component.maxVisible = 5;
      component.page = 5;
      fixture.detectChanges();

      const pages = component.visiblePages();
      expect(pages[0]).toBe(1);
      expect(pages[pages.length - 1]).toBe(10);
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────
  describe('accessibility', () => {
    it('should have aria-label on the nav element', () => {
      const nav: HTMLElement = fixture.nativeElement.querySelector('nav');
      expect(nav.getAttribute('aria-label')).toBeTruthy();
    });

    it('should mark active page button with aria-current="page"', () => {
      component.page = 2;
      fixture.detectChanges();
      const activeBtn = fixture.nativeElement.querySelector('[aria-current="page"]');
      expect(activeBtn).not.toBeNull();
    });
  });
});
