import { TestBed } from '@angular/core/testing';
import { NumberInputComponent } from './number-input.component';

describe('NumberInputComponent', () => {
  it('relaciona ayuda y error con el campo y expone el estado invalido', async () => {
    await TestBed.configureTestingModule({ imports: [NumberInputComponent] }).compileComponents();
    const fixture = TestBed.createComponent(NumberInputComponent);
    fixture.componentRef.setInput('inputId', 'installments');
    fixture.componentRef.setInput('label', 'Cuotas');
    fixture.componentRef.setInput('hint', 'Entre 1 y 24.');
    fixture.componentRef.setInput('error', 'Seleccione un número válido.');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-describedby')).toBe('installments-hint installments-error');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-label')).toBeNull();
    expect(fixture.nativeElement.querySelector('#installments-error').getAttribute('role')).toBe(
      'alert',
    );
  });

  it('incrementa, limita y notifica el control como tocado', async () => {
    await TestBed.configureTestingModule({ imports: [NumberInputComponent] }).compileComponents();
    const fixture = TestBed.createComponent(NumberInputComponent);
    fixture.componentRef.setInput('min', 1);
    fixture.componentRef.setInput('max', 2);
    fixture.componentInstance.writeValue(1);
    const changes: number[] = [];
    let touched = 0;
    fixture.componentInstance.registerOnChange((value) => changes.push(value));
    fixture.componentInstance.registerOnTouched(() => (touched += 1));
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    buttons[1].click();
    fixture.detectChanges();
    buttons[1].click();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('2');
    expect(changes).toEqual([2]);
    expect(touched).toBe(1);
    expect(buttons[1].disabled).toBe(true);
  });

  it('crea identificadores deterministas por instancia', async () => {
    await TestBed.configureTestingModule({ imports: [NumberInputComponent] }).compileComponents();
    const first = TestBed.createComponent(NumberInputComponent);
    const second = TestBed.createComponent(NumberInputComponent);
    first.detectChanges();
    second.detectChanges();

    const firstId = (first.nativeElement.querySelector('input') as HTMLInputElement).id;
    const secondId = (second.nativeElement.querySelector('input') as HTMLInputElement).id;
    expect(firstId).toMatch(/^number-input-\d+$/);
    expect(secondId).toMatch(/^number-input-\d+$/);
    expect(firstId).not.toBe(secondId);
  });
});
