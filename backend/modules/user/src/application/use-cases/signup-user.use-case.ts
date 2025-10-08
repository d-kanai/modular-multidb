import { IUserRepository } from '../../domain/repositories/user.repository.js';
import { User } from '../../domain/entities/user.entity.js';

export class SignupUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(name: string): Promise<User> {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }

    return await this.userRepository.create(name);
  }
}
