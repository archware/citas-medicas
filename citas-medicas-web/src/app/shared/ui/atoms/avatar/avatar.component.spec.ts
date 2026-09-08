import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AvatarComponent, AvatarSize, AvatarStatus } from './avatar.component';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  function setInput(name: string, value: unknown): void {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initials generation', () => {
    it('should generate initials from full name', () => {
      setInput('name', 'Juan Pérez');

      expect(component.computedInitials()).toBe('JP');
    });

    it('should generate initials from single name', () => {
      setInput('name', 'María');

      expect(component.computedInitials()).toBe('M');
    });

    it('should limit initials to 2 characters', () => {
      setInput('name', 'Juan Carlos López');

      expect(component.computedInitials().length).toBeLessThanOrEqual(2);
    });

    it('should use provided initials over name', () => {
      setInput('name', 'Juan Pérez');
      setInput('initials', 'AB');

      expect(component.computedInitials()).toBe('AB');
    });

    it('should uppercase initials', () => {
      setInput('name', 'juan pérez');

      expect(component.computedInitials()).toBe('JP');
    });
  });

  describe('size classes', () => {
    const sizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

    sizes.forEach(size => {
      it(`should apply avatar-${size} class when size is ${size}`, () => {
        setInput('size', size);

        const avatar = fixture.nativeElement.querySelector('.avatar');
        expect(avatar.classList.contains(`avatar-${size}`)).toBe(true);
      });
    });
  });

  describe('status indicator', () => {
    const statuses: AvatarStatus[] = ['online', 'offline', 'busy', 'away'];

    statuses.forEach(status => {
      it(`should show status-${status} indicator when status is ${status}`, () => {
        setInput('status', status);

        const statusEl = fixture.nativeElement.querySelector('.avatar-status');
        expect(statusEl).toBeTruthy();
        expect(statusEl.classList.contains(`status-${status}`)).toBe(true);
      });
    });

    it('should not show status indicator when status is undefined', () => {
      setInput('status', undefined);

      const statusEl = fixture.nativeElement.querySelector('.avatar-status');
      expect(statusEl).toBeNull();
    });

    it('should have aria-label on status indicator', () => {
      setInput('status', 'online');

      const statusEl = fixture.nativeElement.querySelector('.avatar-status');
      expect(statusEl.getAttribute('aria-label')).toBe('online');
    });
  });

  describe('color generation', () => {
    it('should generate consistent color for same name', () => {
      setInput('name', 'Test User');
      const color1 = component.colorFromName();

      setInput('name', 'Test User');
      const color2 = component.colorFromName();

      expect(color1).toBe(color2);
    });

    it('should use fallback color when no name', () => {
      setInput('name', '');

      expect(component.colorFromName()).toBe('var(--gray-500)');
    });
  });

  describe('image', () => {
    it('should display image when src is provided', () => {
      setInput('src', 'https://example.com/avatar.jpg');

      const img = fixture.nativeElement.querySelector('img');
      expect(img).toBeTruthy();
      expect(img.src).toBe('https://example.com/avatar.jpg');
    });

    it('should show initials on image error', () => {
      setInput('src', 'invalid-url.jpg');
      setInput('name', 'John Doe');

      component.onImageError();
      fixture.detectChanges();

      const initialsEl = fixture.nativeElement.querySelector('.avatar-initials');
      expect(initialsEl).toBeTruthy();
    });
  });

  describe('rounded variant', () => {
    it('should add rounded class when rounded is true', () => {
      setInput('rounded', true);

      const avatar = fixture.nativeElement.querySelector('.avatar');
      expect(avatar.classList.contains('avatar-rounded')).toBe(true);
    });
  });

  describe('placeholder', () => {
    it('should show placeholder when no name, initials, or src', () => {
      setInput('name', '');
      setInput('initials', undefined);
      setInput('src', undefined);

      const placeholder = fixture.nativeElement.querySelector('.avatar-placeholder');
      expect(placeholder).toBeTruthy();
    });
  });
});
