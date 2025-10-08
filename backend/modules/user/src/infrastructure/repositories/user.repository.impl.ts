import { IUserRepository } from '../../domain/repositories/user.repository.js';
import { User, UserStatus } from '../../domain/entities/user.entity.js';
import { prisma } from '../database/prisma.client.js';

export class UserRepository implements IUserRepository {
  async save(user: User): Promise<User> {
    const userData = await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

    return User.reconstruct(
      userData.id,
      userData.name,
      userData.status as UserStatus,
      userData.createdAt,
      userData.updatedAt
    );
  }

  async findById(id: string): Promise<User | null> {
    const userData = await prisma.user.findUnique({
      where: { id }
    });

    if (!userData) {
      return null;
    }

    return User.reconstruct(
      userData.id,
      userData.name,
      userData.status as UserStatus,
      userData.createdAt,
      userData.updatedAt
    );
  }

  async update(user: User): Promise<User> {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: user.status,
        updatedAt: user.updatedAt
      }
    });

    // Return the same entity instance to preserve domain events
    return user;
  }
}
