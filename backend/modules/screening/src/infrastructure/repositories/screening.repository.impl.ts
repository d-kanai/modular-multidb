import { IScreeningRepository } from '../../domain/repositories/screening.repository.js';
import { Screening, ScreeningStatus } from '../../domain/entities/screening.entity.js';
import { prisma } from '../database/prisma.client.js';

export class ScreeningRepository implements IScreeningRepository {
  async save(screening: Screening): Promise<Screening> {
    const screeningData = await prisma.screening.create({
      data: {
        id: screening.id,
        userId: screening.userId,
        userName: screening.userName,
        status: screening.status,
        createdAt: screening.createdAt,
        updatedAt: screening.updatedAt
      }
    });

    return Screening.reconstruct(
      screeningData.id,
      screeningData.userId,
      screeningData.userName,
      screeningData.status as ScreeningStatus,
      screeningData.createdAt,
      screeningData.updatedAt
    );
  }

  async findById(id: string): Promise<Screening | null> {
    const screeningData = await prisma.screening.findUnique({
      where: { id }
    });

    if (!screeningData) {
      return null;
    }

    return Screening.reconstruct(
      screeningData.id,
      screeningData.userId,
      screeningData.userName,
      screeningData.status as ScreeningStatus,
      screeningData.createdAt,
      screeningData.updatedAt
    );
  }

  async findAll(): Promise<Screening[]> {
    const screeningsData = await prisma.screening.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return screeningsData.map(data => Screening.reconstruct(
      data.id,
      data.userId,
      data.userName,
      data.status as ScreeningStatus,
      data.createdAt,
      data.updatedAt
    ));
  }

  async update(screening: Screening): Promise<Screening> {
    await prisma.screening.update({
      where: { id: screening.id },
      data: {
        status: screening.status,
        updatedAt: screening.updatedAt
      }
    });

    // Return the same entity instance to preserve domain events
    return screening;
  }
}
