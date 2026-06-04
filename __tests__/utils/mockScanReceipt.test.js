import { mockScanReceipt } from '@/utils/mockScanReceipt';

describe('mockScanReceipt', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('resolves after 2 seconds', async () => {
    const promise = mockScanReceipt('base64data');
    jest.advanceTimersByTime(2000);
    const result = await promise;
    expect(result).toBeDefined();
  });

  it('returns transaction_date and items array', async () => {
    const promise = mockScanReceipt('base64data');
    jest.advanceTimersByTime(2000);
    const result = await promise;
    expect(result.transaction_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items.length).toBeGreaterThan(0);
  });

  it('each item has required schema fields', async () => {
    const promise = mockScanReceipt('base64data');
    jest.advanceTimersByTime(2000);
    const { items } = await promise;
    items.forEach(item => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('category');
      expect(item).toHaveProperty('estimated_expiry_date');
      expect(item).toHaveProperty('confidence_days');
      expect(typeof item.confidence_days).toBe('number');
    });
  });
});
