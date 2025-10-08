import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { screeningRoutes } from './routes/screening.js';

const app = new Hono();

app.use('/*', cors());

app.route('/api/screenings', screeningRoutes);

app.get('/health', (c) => c.json({ status: 'ok' }));

const port = 4001;
console.log(`Screening module server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
