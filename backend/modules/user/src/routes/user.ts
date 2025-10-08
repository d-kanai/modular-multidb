import { Hono } from 'hono';
import { prisma } from '../db.js';

const userRoutes = new Hono();

userRoutes.post('/signup', async (c) => {
  try {
    const { name } = await c.req.json();

    if (!name) {
      return c.json({ error: 'Name is required' }, 400);
    }

    const user = await prisma.user.create({
      data: {
        name,
        status: 'PENDING'
      }
    });

    return c.json(user, 201);
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

userRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export { userRoutes };
