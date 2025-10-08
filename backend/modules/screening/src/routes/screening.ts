import { Hono } from 'hono';
import { prisma } from '../db.js';
import { getUserById } from '../services/user-service.js';
import { publishToUserModule } from '../services/event-bridge.js';

const screeningRoutes = new Hono();

screeningRoutes.post('/apply', async (c) => {
  try {
    const { userId } = await c.req.json();

    if (!userId) {
      return c.json({ error: 'UserId is required' }, 400);
    }

    // Validate user exists by calling user module API
    await getUserById(userId);

    const screening = await prisma.screening.create({
      data: {
        userId,
        status: 'PENDING'
      }
    });

    return c.json(screening, 201);
  } catch (error) {
    console.error('Apply screening error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

screeningRoutes.get('/list', async (c) => {
  try {
    const screenings = await prisma.screening.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return c.json(screenings);
  } catch (error) {
    console.error('List screenings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

screeningRoutes.post('/:id/pass', async (c) => {
  try {
    const id = c.req.param('id');

    const screening = await prisma.screening.findUnique({
      where: { id }
    });

    if (!screening) {
      return c.json({ error: 'Screening not found' }, 404);
    }

    const updatedScreening = await prisma.screening.update({
      where: { id },
      data: { status: 'PASSED' }
    });

    // Publish event to notify user module
    await publishToUserModule('screening.passed', { userId: screening.userId });

    return c.json(updatedScreening);
  } catch (error) {
    console.error('Pass screening error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export { screeningRoutes };
