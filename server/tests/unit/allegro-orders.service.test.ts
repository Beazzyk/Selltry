import { fetchAllegroOrders } from '../../src/services/allegro-orders.service';

// Force MOCK mode — no real Allegro API calls in tests
jest.mock('../../src/utils/env', () => ({
  env: {
    ALLEGRO_MOCK: true,
    ALLEGRO_SANDBOX: false,
    ALLEGRO_USER_AGENT: 'test',
  },
}));

jest.mock('../../src/services/allegro-oauth.service', () => ({
  getValidAccessToken: jest.fn().mockResolvedValue('mock-token'),
}));

describe('fetchAllegroOrders (MOCK mode)', () => {
  it('returns mock orders without calling Allegro API', async () => {
    const orders = await fetchAllegroOrders('user-1');

    expect(orders.length).toBeGreaterThan(0);
  });

  it('every mock order has required fields', async () => {
    const orders = await fetchAllegroOrders('user-1');

    for (const order of orders) {
      expect(order).toHaveProperty('externalOrderId');
      expect(order).toHaveProperty('status');
      expect(order).toHaveProperty('totalAmount');
      expect(Array.isArray(order.items)).toBe(true);
    }
  });

  it('every item has title, quantity and unitPrice', async () => {
    const orders = await fetchAllegroOrders('user-1');

    for (const order of orders) {
      for (const item of order.items) {
        expect(item.title).toBeTruthy();
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.unitPrice).toBeGreaterThan(0);
      }
    }
  });

  it('total amount equals sum of item prices for single-item orders', async () => {
    const orders = await fetchAllegroOrders('user-1');
    const singleItem = orders.find((o) => o.items.length === 1);
    if (!singleItem) return; // skip if no single-item orders

    const expected = singleItem.items[0].unitPrice * singleItem.items[0].quantity;
    expect(singleItem.totalAmount).toBe(expected);
  });
});
