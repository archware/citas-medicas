import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatingInputComponent, FloatingInputVariant } from './floating-input.component';

describe('FloatingInputComponent', () => {
  let component: FloatingInputComponent;
  let fixture: ComponentFixture<FloatingInputComponent>;

  function setInput(name: string, value: unknown): void {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingInputComponent, FormsModule],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('variant classes', () => {
    const variants: FloatingInputVariant[] = ['floating', 'underline', 'material', 'outline'];

    variants.forEach(variant => {
      it(`should apply variant-${variant} class when variant is ${variant}`, () => {
        setInput('variant', variant);

        const wrapper = fixture.nativeElement.querySelector('.floating-input-wrapper');
        expect(wrapper.classList.contains(`variant-${variant}`)).toBe(true);
      });
    });
  });

  describe('label', () => {
    it('should display label text', () => {
      setInput('label', 'Email');

      const label = fixture.nativeElement.querySelector('.floating-label');
      expect(label.textContent).toBe('Email');
    });
  });

  describe('focus state', () => {
    it('should add focused class on focus', () => {
      component.onFocus();
      fixture.detectChanges();

      const wrapper = fixture.nativeElement.querySelector('.floating-input-wrapper');
      expect(wrapper.classList.contains('focused')).toBe(true);
    });

    it('should remove focused class on blur', () => {
      component.onFocus();
      fixture.detectChanges();

      component.onBlur();
      fixture.detectChanges();

      const wrapper = fixture.nativeElement.querySelector('.floating-input-wrapper');
      expect(wrapper.classList.contains('focused')).toBe(false);
    });
  });

  describe('has-value state', () => {
    it('should add has-value class when input has value', () => {
      setInput('value', 'test');

      const wrapper = fixture.nativeElement.querySelector('.floating-input-wrapper');
      expect(wrapper.classList.contains('has-value')).toBe(true);
    });

    it('should not have has-value class when empty', () => {
      setInput('value', '');

      const wrapper = fixture.nativeElement.querySelector('.floating-input-wrapper');
      expect(wrapper.classList.contains('has-value')).toBe(false);
    });
  });

  describe('error state', () => {
    it('should add has-error class when error is provided', () => {
      setInput('error', 'Campo requerido');

      const wrapper = fixture.nativeElement.querySelector('.floating-input-wrapper');
      expect(wrapper.classList.contains('has-error')).toBe(true);
    });

    it('should display error message', () => {
      setInput('error', 'Campo requerido');

      const errorEl = fixture.nativeElement.querySelector('.input-error');
      expect(errorEl.textContent).toBe('Campo requerido');
    });
  });

  describe('disabled state', () => {
    it('should add disabled class when disabled', () => {
      setInput('disabled', true);

      const wrapper = fixture.nativeElement.querySelector('.floating-input-wrapper');
      expect(wrapper.classList.contains('disabled')).toBe(true);
    });

    it('should set disabled attribute on input', () => {
      setInput('disabled', true);

      const input = fixture.nativeElement.querySelector('.floating-input');
      expect(input.disabled).toBe(true);
    });
  });

  describe('password toggle', () => {
    it('should show password toggle button for password type', () => {
      setInput('type', 'password');

      const toggleBtn = fixture.nativeElement.querySelector('.input-icon-btn');
      expect(toggleBtn).toBeTruthy();
    });

    it('should toggle password visibility', () => {
      setInput('type', 'password');

      expect(component.actualType()).toBe('password');

      component.togglePassword();
      fixture.detectChanges();

      expect(component.actualType()).toBe('text');
    });
  });

  describe('ControlValueAccessor', () => {
    it('should write value', () => {
      component.writeValue('test value');
      expect(component.value).toBe('test value');
    });

    it('should handle null value', () => {
      component.writeValue(null as unknown as string);
      expect(component.value).toBe('');
    });

    it('should register onChange callback', () => {
      const fn = vi.fn();
      component.registerOnChange(fn);

      component.onChange('new value');

      expect(fn).toHaveBeenCalledWith('new value');
    });

    it('should register onTouched callback', () => {
      const fn = vi.fn();
      component.registerOnTouched(fn);

      component.onBlur();

      expect(fn).toHaveBeenCalled();
    });

    it('should set disabled state', () => {
      component.setDisabledState(true);
      expect(component.disabled).toBe(true);
    });
  });

  describe('width', () => {
    it('should apply custom width', () => {
      setInput('width', '200px');

      const wrapper = fixture.nativeElement.querySelector('.floating-input-wrapper');
      expect(wrapper.style.width).toBe('200px');
    });
  });
});
