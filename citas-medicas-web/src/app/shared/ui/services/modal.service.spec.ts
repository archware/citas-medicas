import { vi } from 'vitest';
import { ModalService } from './modal.service';

describe('ModalService', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('uses one identifier and closes the confirmed modal', () => {
    const service = new ModalService();
    let confirmed = false;
    const id = service.confirm({
      title: 'Eliminar',
      message: 'Confirme la operación.',
      confirmVariant: 'danger',
      onConfirm: () => { confirmed = true; },
    });

    expect(id).toBe(1);
    service.modals()[0].buttons?.[1].action();
    expect(confirmed).toBe(true);
    expect(service.modals()[0].closing).toBe(true);
    vi.advanceTimersByTime(200);
    expect(service.modals()).toEqual([]);
  });

  it('keeps alert actions scoped to their own modal', () => {
    const service = new ModalService();
    const firstId = service.alert('Primero', 'Mensaje');
    const secondId = service.alert('Segundo', 'Mensaje');

    service.modals().find((modal) => modal.id === firstId)?.buttons?.[0].action();
    vi.advanceTimersByTime(200);

    expect(service.modals().map((modal) => modal.id)).toEqual([secondId]);
  });
});
