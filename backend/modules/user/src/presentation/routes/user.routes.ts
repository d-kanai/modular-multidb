import { Hono } from 'hono';
import { UserController } from '../controllers/user.controller.js';

export function createUserRoutes(userController: UserController) {
  const userRoutes = new Hono();

  userRoutes.post('/signup', (c) => userController.signup(c));
  userRoutes.get('/:id', (c) => userController.getById(c));

  return userRoutes;
}
