import { Hono } from 'hono';
import { ScreeningController } from '../controllers/screening.controller.js';

export function createScreeningRoutes(screeningController: ScreeningController) {
  const screeningRoutes = new Hono();

  screeningRoutes.post('/apply', (c) => screeningController.apply(c));
  screeningRoutes.get('/list', (c) => screeningController.list(c));
  screeningRoutes.post('/:id/pass', (c) => screeningController.pass(c));

  return screeningRoutes;
}
