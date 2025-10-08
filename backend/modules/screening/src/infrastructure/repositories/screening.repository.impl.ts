import { IScreeningRepository } from '../../domain/repositories/screening.repository.js';
import { Screening, ScreeningStatus } from '../../domain/entities/screening.entity.js';
import { prisma } from '../database/prisma.client.js';

export class ScreeningRepository implements IScreeningRepository {
  async create(userId: string): Promise<Screening> {
    const screeningData = await prisma.screening.create({
      data: {
        userId,
        status: ScreeningStatus.PENDING
      }
    });

    return new Screening(
      screeningData.id,
      screeningData.userId,
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

    return new Screening(
      screeningData.id,
      screeningData.userId,
      screeningData.status as ScreeningStatus,
      screeningData.createdAt,
      screeningData.updatedAt
    );
  }

  async findAll(): Promise<Screening[]> {
    const screeningsData = await prisma.screening.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return screeningsData.map(data => new Screening(
      data.id,
      data.userId,
      data.status as ScreeningStatus,
      data.createdAt,
      data.updatedAt
    ));
  }

  async update(screening: Screening): Promise<Screening> {
    const screeningData = await prisma.screening.update({
      where: { id: screening.id },
      data: {
        status: screening.status,
        updatedAt: screening.updatedAt
      }
    });

    return new Screening(
      screeningData.id,
      screeningData.userId,
      screeningData.status as ScreeningStatus,
      screeningData.createdAt,
      screeningData.updatedAt
    );
  }
}
