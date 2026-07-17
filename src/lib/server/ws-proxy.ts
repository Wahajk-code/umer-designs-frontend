import type { Server as HttpServer, IncomingMessage } from 'http';
import type { Socket } from 'net';
import httpProxy from 'http-proxy';
import { getServerEnv } from '@/lib/server/env';
import { buildInternalAttestationHeaders } from '@/lib/server/internal-signature';
import { ACCESS_TOKEN_COOKIE } from '@/lib/server/session-cookies';

/**
 * Fixed canonical method/path the backend's WhiteboardGateway expects for
 * the internal attestation signature on this channel — must match
 * WS_ATTESTATION_METHOD / WS_ATTESTATION_PATH in the Nest gateway exactly.
 */
const WS_ATTESTATION_METHOD = 'GET';
const WS_ATTESTATION_PATH = '/socket.io';

function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Attaches a raw WebSocket proxy from this Next server to the Nest backend's
 * Socket.IO gateway. This is the only reason we run a custom server instead
 * of plain `next start`: the browser opens a WS connection to *this* origin
 * only, we authenticate it here (cookie + Origin check), then forward it
 * server-to-server with the internal HMAC attestation + the user's access
 * token as a header (the native browser WebSocket API can't set custom
 * headers itself, so this is the only place that can inject them).
 */
export function attachWhiteboardProxy(server: HttpServer): void {
  const env = getServerEnv();
  const proxy = httpProxy.createProxyServer({ target: env.INTERNAL_API_URL, ws: true });

  proxy.on('error', (err) => {
    console.error('[ws-proxy] backend proxy error:', err.message);
  });

  server.on('upgrade', (req: IncomingMessage, socket: Socket, head: Buffer) => {
    const url = req.url ?? '';
    if (!url.startsWith('/socket.io')) {
      // Not ours — leave the socket alone so Next's own upgrade listener
      // (self-registered on this same server for dev-mode HMR/Turbopack)
      // gets to handle it. Destroying it here killed Next's hot-reload
      // websocket on every request.
      return;
    }

    const origin = req.headers.origin;
    if (origin && origin !== env.APP_ORIGIN) {
      socket.destroy();
      return;
    }

    const accessToken = readCookie(req.headers.cookie, ACCESS_TOKEN_COOKIE);
    if (!accessToken) {
      socket.destroy();
      return;
    }

    const attestation = buildInternalAttestationHeaders(
      env.INTERNAL_HMAC_SECRET,
      WS_ATTESTATION_METHOD,
      WS_ATTESTATION_PATH,
    );

    proxy.ws(req, socket, head, {
      headers: {
        ...attestation,
        'x-access-token': accessToken,
      },
    });
  });
}
