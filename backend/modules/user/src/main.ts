import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { createUserRoutes } from './presentation/routes/user.routes.js';
import { createEventRoutes } from './presentation/routes/event.routes.js';
import { userController, eventController, setupEventSubscribers } from './infrastructure/di/container.js';

const app = new Hono();

app.use('/*', cors());

app.route('/api/users', createUserRoutes(userController));
app.route('/api/events', createEventRoutes(eventController));

app.get('/health', (c) => c.json({ status: 'ok' }));

// Setup event subscribers
setupEventSubscribers();

const port = 4000;
console.log(`User module server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
