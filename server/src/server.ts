/**
 * HTTP Server Entry Point
 *
 * Responsible only for binding the Express app to a port.
 * All application logic lives in app.ts and its dependencies.
 */

import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 3001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`[server] LAAM Confidence API listening on http://localhost:${PORT}`);
  console.log(`[server] Health check: http://localhost:${PORT}/health`);
});
