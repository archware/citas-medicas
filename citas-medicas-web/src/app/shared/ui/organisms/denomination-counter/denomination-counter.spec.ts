import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  DenominationCount,
  DenominationCounter,
  DenominationDefinition,
} from './denomination-counter';

@Component({
  standalone: true,
  imports: [DenominationCounter, ReactiveFormsModule],
  template: `
    <app-denomination-counter
      title="Efectivo recibido"
      [optional]="true"
      [open]="true"
      [state]="state"
      [denominations]="denominations"
      [formControl]="control"
    />
  `,
})
class TestHost {
  state: 'empty' | 'suggested' | 'confirmed' = 'confirmed';
  readonly denominations: readonly DenominationDefinition[] = [
    { code: 'PEN_200', value: 200, label: 'S/ 200', description: 'Billete' },
    { code: 'PEN_050_COIN', value: 0.5, label: 'S/ 0.50', description: 'Moneda' },
  ];
  readonly control = new FormControl([{ code: 'PEN_200', quantity: 2 }]);
}

describe('DenominationCounter', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
  });

  it('renders consumer-provided denominations inside the canonical Accordion', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('app-accordion')).not.toBeNull();
    expect(host.textContent).toContain('Opcional para auditoría');
    expect(host.textContent).toContain('S/ 200');
    expect(host.textContent).toContain('S/ 0.50');
    expect(host.textContent).toContain('S/ 400.00');
    expect(host.textContent).toContain('El backend conserva la autoridad');
  });

  it('updates the CVA value and total when a quantity changes', () => {
    const inputs = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>(
      'input[type="number"]',
    );

    inputs[1].value = '3';
    inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toEqual([
      { code: 'PEN_200', quantity: 2 },
      { code: 'PEN_050_COIN', quantity: 3 },
    ]);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('S/ 401.50');
  });

  it('refreshes the total when a controlled value is supplied programmatically', () => {
    const component = fixture.debugElement.children[0].componentInstance as DenominationCounter;

    component.value = [{ code: 'PEN_050_COIN', quantity: 3 }];
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('S/ 1.50');
  });

  it('emits the controlled suggestion only after the operator confirms it', () => {
    const host = fixture.componentInstance;
    const component = fixture.debugElement.children[0].componentInstance as DenominationCounter;
    const emitted: unknown[] = [];
    component.valueChange.subscribe((value) => emitted.push(value));
    host.state = 'suggested';
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.denomination-counter__status button',
    );
    expect(button).not.toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Sugerido, pendiente de confirmar',
    );

    button?.click();
    fixture.detectChanges();

    expect(emitted.at(-1)).toEqual([{ code: 'PEN_200', quantity: 2 }]);
  });

  it('does not render a confirmation action for an already confirmed count', () => {
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.denomination-counter__status button'),
    ).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Desglose confirmado');
  });

  it('defers denomination controls while the optional audit is collapsed', () => {
    const component = fixture.debugElement.children[0].componentInstance as DenominationCounter;

    component.open = false;
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('input[type="number"]'),
    ).toHaveLength(0);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Opcional para auditoría');
  });

  it('synchronizes the public open state after an accordion interaction', () => {
    const component = fixture.debugElement.children[0].componentInstance as DenominationCounter;
    const emitted: boolean[] = [];
    component.openChange.subscribe((open) => emitted.push(open));

    component.setExpanded(false);
    fixture.detectChanges();

    expect(component.open).toBe(false);
    expect(component.expanded()).toBe(false);
    expect(emitted).toEqual([false]);
  });

  it('removes invalid and duplicate definitions without emitting fractional quantities', () => {
    const component = fixture.debugElement.children[0].componentInstance as DenominationCounter;
    const emitted: unknown[] = [];
    component.valueChange.subscribe((value) => emitted.push(value));

    component.denominations = [
      { code: 'PEN_1', value: 1, label: 'S/ 1' },
      { code: 'PEN_1', value: 1, label: 'Duplicada' },
      { code: 'INVALID', value: 0, label: 'Inválida' },
    ];
    component.setQuantity('PEN_1', 2.9);
    fixture.detectChanges();

    expect(component.rows().map((row) => row.code)).toEqual(['PEN_1']);
    expect(emitted.at(-1)).toEqual([{ code: 'PEN_1', quantity: 2 }]);
  });

  it('preserves a CVA value received before the asynchronous denomination catalog', () => {
    const pendingFixture = TestBed.createComponent(DenominationCounter);
    const component = pendingFixture.componentInstance;

    component.writeValue([{ code: 'PEN_100', quantity: 2 }]);
    component.denominations = [];
    component.denominations = [{ code: 'PEN_100', value: 100, label: 'S/ 100' }];
    pendingFixture.detectChanges();

    expect(component.rows()).toEqual([
      expect.objectContaining({ code: 'PEN_100', quantity: 2, subtotal: 200 }),
    ]);
    expect(component.total()).toBe(200);
  });

  it('notifies the CVA when a later catalog change removes an active denomination', () => {
    const component = fixture.debugElement.children[0].componentInstance as DenominationCounter;
    const changes: DenominationCount[][] = [];
    component.writeValue([
      { code: 'PEN_200', quantity: 2 },
      { code: 'PEN_050_COIN', quantity: 3 },
    ]);
    component.registerOnChange((value) => changes.push([...value]));

    component.denominations = [
      { code: 'PEN_200', value: 200, label: 'S/ 200', description: 'Billete' },
    ];

    expect(changes).toEqual([[{ code: 'PEN_200', quantity: 2 }]]);
  });

  it('normalizes a fractional maximum and reapplies it to existing quantities', () => {
    const component = fixture.debugElement.children[0].componentInstance as DenominationCounter;
    const changes: DenominationCount[][] = [];
    component.writeValue([{ code: 'PEN_200', quantity: 8 }]);
    component.registerOnChange((value) => changes.push([...value]));

    component.maxQuantity = 2.9;

    expect(component.maxQuantity).toBe(2);
    expect(component.rows()[0]?.quantity).toBe(2);
    expect(changes).toEqual([[{ code: 'PEN_200', quantity: 2 }]]);
  });
});
