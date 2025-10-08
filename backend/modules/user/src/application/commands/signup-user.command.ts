import { IUserRepository } from '../../domain/repositories/user.repository.js';
import { User } from '../../domain/entities/user.entity.js';

export class SignupUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(name: string): Promise<User> {
    // Create user entity using factory method (includes validation and ID generation)
    const user = User.signup(name);

    // Save user entity
    return await this.userRepository.save(user);
  }
}
