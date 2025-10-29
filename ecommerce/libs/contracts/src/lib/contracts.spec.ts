import { ORDER_EVENT_TYPES, ORDER_EVENT_VERSION } from './contracts';

describe('order contracts', () => {
  it('exposes all supported order events', () => {
    expect(ORDER_EVENT_TYPES).toEqual([
      'order_placed',
      'order_confirmed',
      'order_shipped',
      'order_completed',
    ]);
  });

  it('exposes a semantic version for event payloads', () => {
    expect(ORDER_EVENT_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
