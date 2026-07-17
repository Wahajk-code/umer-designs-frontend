import { parseExpiresInToSeconds } from '@/lib/server/session-cookies';

describe('parseExpiresInToSeconds', () => {
  it('parses minutes', () => {
    expect(parseExpiresInToSeconds('15m')).toBe(900);
  });

  it('parses hours', () => {
    expect(parseExpiresInToSeconds('1h')).toBe(3600);
  });

  it('parses days', () => {
    expect(parseExpiresInToSeconds('7d')).toBe(7 * 86400);
  });

  it('parses seconds', () => {
    expect(parseExpiresInToSeconds('30s')).toBe(30);
  });

  it('falls back to 15 minutes for an unrecognized format', () => {
    expect(parseExpiresInToSeconds('garbage')).toBe(900);
  });
});
