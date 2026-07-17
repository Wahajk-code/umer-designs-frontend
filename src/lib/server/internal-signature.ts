import 'server-only';
import { createHmac, randomUUID } from 'crypto';

/**
 * Mirrors backend/src/common/security/internal-signature.util.ts exactly —
 * duplicated (not shared via a package) because the two apps live in
 * separate repos. Keep both in sync if this scheme ever changes.
 */
function buildInternalSignaturePayload(
  timestamp: string,
  nonce: string,
  method: string,
  path: string,
): string {
  return `${timestamp}.${nonce}.${method.toUpperCase()}.${path}`;
}

export interface InternalAttestationHeaders {
  'x-internal-timestamp': string;
  'x-internal-nonce': string;
  'x-internal-signature': string;
}

export function buildInternalAttestationHeaders(
  secret: string,
  method: string,
  path: string,
): InternalAttestationHeaders {
  const timestamp = String(Date.now());
  const nonce = randomUUID();
  const payload = buildInternalSignaturePayload(timestamp, nonce, method, path);
  const signature = createHmac('sha256', secret).update(payload).digest('hex');

  return {
    'x-internal-timestamp': timestamp,
    'x-internal-nonce': nonce,
    'x-internal-signature': signature,
  };
}
