import { Hono } from 'hono';
import { UserController } from '../controllers/user.controller.js';
import { internalAuthMiddleware } from '../middleware/internal-auth.middleware.js';

export function createUserRoutes(userController: UserController) {
  const userRoutes = new Hono();

  userRoutes.post('/signup', (c) => userController.signup(c));

  // Internal API - requires authentication
  userRoutes.get('/:id', internalAuthMiddleware, (c) => userController.getById(c));

  return userRoutes;
}
