import { Hono } from 'hono';
import { EventController } from '../controllers/event.controller.js';

export function createEventRoutes(eventController: EventController) {
  const eventRoutes = new Hono();

  eventRoutes.post('/', (c) => eventController.handleEvent(c));

  return eventRoutes;
}
