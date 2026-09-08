// SKIP jsdom: specs del ADN que miden layout/roles reales de navegador (o esperan clases retiradas en 5.7.4). Ver docs/ATOMIC_DECISION_5.7.md.
import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionGroupComponent } from './action-group.component';

describe('ActionGroupComponent', () => {
  let component: ActionGroupComponent;
  let fixture: ComponentFixture<ActionGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionGroupComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionGroupComponent);
    component = fixture.componentInstance;
    component.actions = [
      { id: 'view', icon: 'fa-solid fa-eye', label: 'Ver detalle' },
      { id: 'edit', icon: 'fa-solid fa-pen', label: 'Editar', variant: 'primary' },
    ];
  });

  afterEach(() => {
    fixture.destroy();
  });

  it.skip('renders accessible labels and preserves the 28px small variant', () => {
    component.size = 'sm';
    fixture.detectChanges();

    const group = fixture.nativeElement.querySelector('.action-group') as HTMLElement;
    const buttons = fixture.nativeElement.querySelectorAll(
      '.action-btn',
    ) as NodeListOf<HTMLButtonElement>;

    expect(group.classList).toContain('action-group--sm');
    expect(getComputedStyle(buttons[0]).width).toBe('28px');
    expect(buttons[0].getAttribute('aria-label')).toBe('Ver detalle');
    expect(buttons[1].getAttribute('aria-label')).toBe('Editar');
  });

  it('emits a single action for native button activation', () => {
    const actionClick = vi.fn();
    component.actionClick.subscribe(actionClick);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.action-btn') as HTMLButtonElement).click();

    expect(actionClick).toHaveBeenCalledExactlyOnceWith('view');
  });

  it('shows up to three actions without an overflow trigger', () => {
    component.actions = [
      { id: 'view', action: 'view', label: 'Ver' },
      { id: 'edit', action: 'edit', label: 'Editar' },
      { id: 'print', action: 'print', label: 'Imprimir' },
    ];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.action-btn')).toHaveLength(3);
    expect(fixture.nativeElement.querySelector('.action-btn--more')).toBeNull();
  });

  it('keeps three actions visible and moves the fourth behind a caret menu', () => {
    const actionClick = vi.fn();
    component.actionClick.subscribe(actionClick);
    component.actions = [
      { id: 'view', action: 'view', label: 'Ver' },
      { id: 'edit', action: 'edit', label: 'Editar' },
      { id: 'print', action: 'print', label: 'Imprimir' },
      { id: 'reverse', action: 'reverse', label: 'Revertir' },
    ];
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.action-btn--more') as HTMLButtonElement;
    const visible = fixture.nativeElement.querySelectorAll('.action-btn:not(.action-btn--more)');
    expect(visible).toHaveLength(3);
    expect(trigger.querySelector('.fa-caret-down')).not.toBeNull();
    expect(trigger.querySelector('.fa-ellipsis, .fa-ellipsis-vertical')).toBeNull();

    trigger.click();

    const menu = document.body.querySelector(`#${component.menuId}`) as HTMLElement;
    const menuItems = menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    expect(menu.getAttribute('role')).toBe('menu');
    expect(menuItems).toHaveLength(1);
    expect(menuItems[0].getAttribute('aria-label')).toBe('Revertir');
    expect(menuItems[0].querySelector('.fa-rotate-left')).not.toBeNull();

    menuItems[0].click();
    expect(actionClick).toHaveBeenCalledExactlyOnceWith('reverse');
    expect(document.body.querySelector(`#${component.menuId}`)).toBeNull();
  });

  it('filters disabled menu items from keyboard focus and restores the trigger on Escape', () => {
    component.actions = [
      { id: 'view', action: 'view', label: 'Ver' },
      { id: 'edit', action: 'edit', label: 'Editar' },
      { id: 'print', action: 'print', label: 'Imprimir' },
      { id: 'reverse', action: 'reverse', label: 'Revertir', disabled: true },
      { id: 'channels', action: 'channels', label: 'Canales' },
    ];
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.action-btn--more') as HTMLButtonElement;
    trigger.click();
    const menu = document.body.querySelector(`#${component.menuId}`) as HTMLElement;
    const enabled = menu.querySelectorAll<HTMLButtonElement>('.menu-item:not(:disabled)');
    expect(enabled).toHaveLength(1);

    component.onEscape();
    expect(document.activeElement).toBe(trigger);
  });
});
