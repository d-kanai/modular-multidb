import { Hono } from 'hono';
import { eventBus } from '../events/event-bus.js';

const eventRoutes = new Hono();

eventRoutes.post('/', async (c) => {
  try {
    const { eventName, data } = await c.req.json();

    if (!eventName) {
      return c.json({ error: 'Event name is required' }, 400);
    }

    await eventBus.publish(eventName, data);

    return c.json({ success: true });
  } catch (error) {
    console.error('Event handling error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export { eventRoutes };
