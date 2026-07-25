import { createHmac } from 'crypto';

const ORIGINAL_ENV = process.env;

function setTestEnv() {
  process.env = {
    ...ORIGINAL_ENV,
    INTERNAL_API_URL: 'http://backend.internal',
    INTERNAL_HMAC_SECRET: 'a-very-secret-value-that-is-long-enough',
    APP_ORIGIN: 'http://localhost:3000',
    NODE_ENV: 'test',
  };
}

describe('callBackend', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    setTestEnv();
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    });
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    global.fetch = originalFetch;
  });

  it('signs the pathname only, not the query string — matching the backend guard, which verifies against the path with the query string stripped', async () => {
    const { callBackend } = await import('@/lib/server/backend-client');
    await callBackend('/designs?sort=newest&page=1&pageSize=12');

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0];
    const signature = requestInit.headers['x-internal-signature'];
    const timestamp = requestInit.headers['x-internal-timestamp'];
    const nonce = requestInit.headers['x-internal-nonce'];

    const expectedSignedOverPathOnly = createHmac('sha256', 'a-very-secret-value-that-is-long-enough')
      .update(`${timestamp}.${nonce}.GET./designs`)
      .digest('hex');

    expect(signature).toBe(expectedSignedOverPathOnly);
  });

  it('still requests the full URL including the query string', async () => {
    const { callBackend } = await import('@/lib/server/backend-client');
    await callBackend('/designs?sort=newest&page=1&pageSize=12');

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('http://backend.internal/designs?sort=newest&page=1&pageSize=12');
  });
});
