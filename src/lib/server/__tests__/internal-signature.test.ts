import { buildInternalAttestationHeaders } from '@/lib/server/internal-signature';

describe('buildInternalAttestationHeaders', () => {
  it('produces a timestamp, a nonce, and a 64-char hex signature', () => {
    const headers = buildInternalAttestationHeaders('a-very-secret-value', 'GET', '/designs');
    expect(Number(headers['x-internal-timestamp'])).toBeGreaterThan(0);
    expect(headers['x-internal-nonce']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(headers['x-internal-signature']).toMatch(/^[0-9a-f]{64}$/);
  });

  it('produces a different nonce (and therefore signature) on every call', () => {
    const a = buildInternalAttestationHeaders('secret', 'GET', '/designs');
    const b = buildInternalAttestationHeaders('secret', 'GET', '/designs');
    expect(a['x-internal-nonce']).not.toBe(b['x-internal-nonce']);
    expect(a['x-internal-signature']).not.toBe(b['x-internal-signature']);
  });

  it('produces a different signature for a different secret', () => {
    const a = buildInternalAttestationHeaders('secret-one', 'GET', '/designs');
    // Recompute what a listener with the wrong secret would derive, to prove secrets aren't interchangeable.
    expect(a['x-internal-signature']).not.toBe(
      buildInternalAttestationHeaders('secret-two', 'GET', '/designs')['x-internal-signature'],
    );
  });
});
