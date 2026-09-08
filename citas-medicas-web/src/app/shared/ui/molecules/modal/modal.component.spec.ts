import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  function setInput(name: string, value: unknown): void {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Title ─────────────────────────────────────────────────────────────────
  describe('title', () => {
    it('should render the title text', () => {
      setInput('title', 'Confirmar acción');
      const title: HTMLElement = fixture.nativeElement.querySelector('.modal-title');
      expect(title.textContent?.trim()).toBe('Confirmar acción');
    });
  });

  // ── Size classes ──────────────────────────────────────────────────────────
  describe('size', () => {
    it('should apply modal-md class by default', () => {
      const modal: HTMLElement = fixture.nativeElement.querySelector('.modal');
      expect(modal.classList.contains('modal-md')).toBe(true);
    });

    it('should apply modal-sm class for size sm', () => {
      setInput('size', 'sm');
      const modal: HTMLElement = fixture.nativeElement.querySelector('.modal');
      expect(modal.classList.contains('modal-sm')).toBe(true);
    });

    it('should apply modal-lg class for size lg', () => {
      setInput('size', 'lg');
      const modal: HTMLElement = fixture.nativeElement.querySelector('.modal');
      expect(modal.classList.contains('modal-lg')).toBe(true);
    });
  });

  // ── Close events ──────────────────────────────────────────────────────────
  describe('closed event', () => {
    it('should emit closed when the X button is clicked', () => {
      let emitted = false;
      component.closed.subscribe(() => { emitted = true; });

      const closeBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.modal-close');
      closeBtn.click();

      expect(emitted).toBe(true);
    });

    it('should emit closed on backdrop click when closeOnBackdrop=true', () => {
      let emitted = false;
      setInput('closeOnBackdrop', true);
      component.closed.subscribe(() => { emitted = true; });

      component.onBackdropClick();

      expect(emitted).toBe(true);
    });

    it('should NOT emit closed on backdrop click when closeOnBackdrop=false', () => {
      let emitted = false;
      setInput('closeOnBackdrop', false);
      component.closed.subscribe(() => { emitted = true; });

      component.onBackdropClick();

      expect(emitted).toBe(false);
    });

    it('should emit closed on Escape when closeOnBackdrop=true', () => {
      let emitted = false;
      setInput('closeOnBackdrop', true);
      component.closed.subscribe(() => { emitted = true; });

      component.onEscape();

      expect(emitted).toBe(true);
    });

    it('should NOT emit closed on Escape when closeOnBackdrop=false', () => {
      let emitted = false;
      setInput('closeOnBackdrop', false);
      component.closed.subscribe(() => { emitted = true; });

      component.onEscape();

      expect(emitted).toBe(false);
    });
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  describe('footer', () => {
    it('should render footer section when hasFooter=true', () => {
      setInput('hasFooter', true);
      const footer = fixture.nativeElement.querySelector('.modal-footer');
      expect(footer).not.toBeNull();
    });

    it('should hide footer section when hasFooter=false', () => {
      setInput('hasFooter', false);
      const footer = fixture.nativeElement.querySelector('.modal-footer');
      expect(footer).toBeNull();
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────
  describe('accessibility', () => {
    it('should have role="dialog" on the modal panel', () => {
      const modal: HTMLElement = fixture.nativeElement.querySelector('.modal');
      expect(modal.getAttribute('role')).toBe('dialog');
    });

    it('should have aria-modal="true" on the modal panel', () => {
      const modal: HTMLElement = fixture.nativeElement.querySelector('.modal');
      expect(modal.getAttribute('aria-modal')).toBe('true');
    });

    it('should have aria-label on the close button', () => {
      const closeBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.modal-close');
      expect(closeBtn.getAttribute('aria-label')).toBeTruthy();
    });
  });
});
