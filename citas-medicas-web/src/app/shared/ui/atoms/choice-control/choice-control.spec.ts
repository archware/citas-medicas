import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ChoiceControl } from './choice-control';

describe('ChoiceControl', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoiceControl],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders a controlled checkbox and emits its boolean state', async () => {
    const fixture = TestBed.createComponent(ChoiceControl);
    fixture.componentRef.setInput('label', 'Seleccionar cuenta');
    fixture.componentRef.setInput('checked', true);
    let selected = true;
    fixture.componentInstance.changed.subscribe((checked) => (selected = checked));
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBe(true);
    expect(fixture.nativeElement.classList.contains('choice-control--checked')).toBe(true);
    expect(input.getAttribute('aria-label')).toBe('Seleccionar cuenta');
    input.checked = false;
    input.dispatchEvent(new Event('change'));
    expect(selected).toBe(false);
  });

  it('supports an accessible radio without visible text', async () => {
    const fixture = TestBed.createComponent(ChoiceControl);
    fixture.componentRef.setInput('type', 'radio');
    fixture.componentRef.setInput('ariaLabel', 'Cliente registrado');
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('radio');
    expect(fixture.nativeElement.classList.contains('choice-control--disabled')).toBe(true);
    expect(input.getAttribute('aria-label')).toBe('Cliente registrado');
  });
});
