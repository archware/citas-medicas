import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Select } from './select';

describe('Select', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Select],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders CVA values and controlled selections', async () => {
    const fixture = TestBed.createComponent(Select);
    fixture.componentRef.setInput('options', [
      { value: 'A', label: 'Activo' },
      { value: 'I', label: 'Inactivo' },
    ]);
    fixture.componentInstance.writeValue('I');
    await fixture.whenStable();
    const element = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(element.value).toBe('I');

    fixture.componentRef.setInput('selected', 'A');
    await fixture.whenStable();
    expect(element.value).toBe('A');
  });

  it('emits a selected value and preserves an unknown legacy value', async () => {
    const fixture = TestBed.createComponent(Select);
    fixture.componentRef.setInput('options', [{ value: 'A', label: 'Activo' }]);
    fixture.componentInstance.writeValue('LEGACY');
    let selected = '';
    fixture.componentInstance.selectionChange.subscribe((value) => (selected = value));
    await fixture.whenStable();

    const element = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(element.value).toBe('LEGACY');
    element.value = 'A';
    element.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(selected).toBe('A');
  });

  it('preserves numeric option values in the CVA model', async () => {
    const fixture = TestBed.createComponent(Select);
    fixture.componentRef.setInput('options', [{ value: 7, label: 'Crédito personal' }]);
    let selected: unknown;
    fixture.componentInstance.registerOnChange((value) => (selected = value));
    await fixture.whenStable();

    const element = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    element.value = '7';
    element.dispatchEvent(new Event('change'));

    expect(selected).toBe(7);
  });

  it('identifica visualmente los campos obligatorios', async () => {
    const fixture = TestBed.createComponent(Select);
    fixture.componentRef.setInput('label', 'Tipo de vivienda');
    fixture.componentRef.setInput('required', true);
    await fixture.whenStable();

    const marker = fixture.nativeElement.querySelector('.field__required') as HTMLElement;
    const element = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(marker.textContent?.trim()).toBe('*');
    expect(element.getAttribute('aria-required')).toBe('true');
  });
});
