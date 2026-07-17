import { createServer } from 'http';
import next from 'next';
import { attachWhiteboardProxy } from '@/lib/server/ws-proxy';

const port = parseInt(process.env.PORT ?? '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

/**
 * A custom server (rather than plain `next start`) so we can attach a
 * `server.on('upgrade', ...)` handler that proxies WebSocket frames to the
 * Nest whiteboard gateway server-side — the browser only ever sees this
 * origin, never the backend's address, even for realtime features.
 */
app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  attachWhiteboardProxy(server);

  server.listen(port, () => {
    console.log(`> Umer Designs frontend listening on http://localhost:${port} (${dev ? 'development' : process.env.NODE_ENV})`);
  });
});
