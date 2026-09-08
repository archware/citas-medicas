import { vi } from 'vitest';
import { PopupService } from './popup.service';

describe('PopupService', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('closes the popup that owns the action when several are open', () => {
    const service = new PopupService();
    const firstId = service.info('Primero', 'Mensaje');
    const secondId = service.success('Segundo', 'Mensaje');

    service.popups().find((popup) => popup.id === firstId)?.buttons?.[0].action();

    expect(service.popups().find((popup) => popup.id === firstId)?.closing).toBe(true);
    expect(service.popups().find((popup) => popup.id === secondId)?.closing).toBeFalsy();
    vi.advanceTimersByTime(200);
    expect(service.popups().map((popup) => popup.id)).toEqual([secondId]);
  });

  it('uses one identifier and closes a confirmation after accepting it', () => {
    const service = new PopupService();
    let confirmed = false;
    const id = service.confirm({
      title: 'Eliminar',
      message: 'Confirme la operación.',
      onConfirm: () => { confirmed = true; },
    });

    expect(id).toBe(1);
    service.popups()[0].buttons?.[1].action();
    expect(confirmed).toBe(true);
    vi.advanceTimersByTime(200);
    expect(service.popups()).toEqual([]);
  });
});
