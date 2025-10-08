import { Context } from 'hono';
import { SignupUserUseCase } from '../../application/commands/signup-user.command.js';
import { GetUserUseCase } from '../../application/queries/get-user.query.js';

export class UserController {
  constructor(
    private readonly signupUserUseCase: SignupUserUseCase,
    private readonly getUserUseCase: GetUserUseCase
  ) {}

  async signup(c: Context) {
    try {
      const { name } = await c.req.json();

      const user = await this.signupUserUseCase.execute(name);

      return c.json({
        id: user.id,
        name: user.name,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }, 201);
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  async getById(c: Context) {
    try {
      const id = c.req.param('id');

      const user = await this.getUserUseCase.execute(id);

      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }

      return c.json({
        id: user.id,
        name: user.name,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      console.error('Get user error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
}
