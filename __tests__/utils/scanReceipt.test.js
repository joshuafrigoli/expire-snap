import { scanReceipt } from '@/utils/scanReceipt';

global.fetch = jest.fn();

const mockValidResponse = {
  transaction_date: '2026-06-03',
  items: [{ id: 'uuid-001', name: 'Milk', category: 'Dairy', estimated_expiry_date: '2026-06-09', confidence_days: 1 }],
};

describe('scanReceipt', () => {
  beforeEach(() => fetch.mockClear());

  it('calls correct OpenAI endpoint for openai provider', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(mockValidResponse) } }] }) });
    await scanReceipt('base64img', 'openai', 'sk-test');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('openai.com'), expect.any(Object));
  });

  it('calls correct Gemini endpoint for gemini provider', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(mockValidResponse) }] } }] }) });
    await scanReceipt('base64img', 'gemini', 'key-test');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('googleapis.com'), expect.any(Object));
  });

  it('calls correct Anthropic endpoint for anthropic provider', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ content: [{ text: JSON.stringify(mockValidResponse) }] }) });
    await scanReceipt('base64img', 'anthropic', 'sk-ant-test');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('anthropic.com'), expect.any(Object));
  });

  it('throws on unknown provider', async () => {
    await expect(scanReceipt('base64img', 'unknown', 'key')).rejects.toThrow(/provider/i);
  });

  it('throws descriptive error on malformed AI response (missing items)', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ transaction_date: '2026-06-03' }) } }] }) });
    await expect(scanReceipt('base64img', 'openai', 'sk-test')).rejects.toThrow(/invalid/i);
  });

  it('throws on HTTP error response', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: 'Unauthorized' }) });
    await expect(scanReceipt('base64img', 'openai', 'sk-test')).rejects.toThrow(/401/);
  });

  it('throws RateLimitError on HTTP 429', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({ error: 'Too Many Requests' }) });
    let err;
    try { await scanReceipt('base64img', 'openai', 'sk-test'); } catch (e) { err = e; }
    expect(err).toBeDefined();
    expect(err.name).toBe('RateLimitError');
  });
});
