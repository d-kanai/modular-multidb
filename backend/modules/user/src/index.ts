import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { userRoutes } from './routes/user.js';
import { eventRoutes } from './routes/events.js';
import { setupEventSubscribers } from './events/subscribers.js';

const app = new Hono();

app.use('/*', cors());

app.route('/api/users', userRoutes);
app.route('/api/events', eventRoutes);

app.get('/health', (c) => c.json({ status: 'ok' }));

// Setup event subscribers
setupEventSubscribers();

const port = 4000;
console.log(`User module server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
