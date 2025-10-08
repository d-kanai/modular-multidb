import { Context } from 'hono';
import { eventBus } from '../../infrastructure/events/event-bus.js';

export class EventController {
  async handleEvent(c: Context) {
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
  }
}
