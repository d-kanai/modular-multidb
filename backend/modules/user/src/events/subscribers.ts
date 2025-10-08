import { eventBus } from './event-bus.js';
import { prisma } from '../db.js';

export function setupEventSubscribers() {
  eventBus.subscribe('screening.passed', async (data: { userId: string }) => {
    console.log('[User Module] Received screening.passed event:', data);

    await prisma.user.update({
      where: { id: data.userId },
      data: { status: 'ACTIVE' }
    });

    console.log(`[User Module] Updated user ${data.userId} status to ACTIVE`);
  });
}
