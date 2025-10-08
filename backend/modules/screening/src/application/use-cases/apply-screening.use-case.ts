import { IScreeningRepository } from '../../domain/repositories/screening.repository.js';
import { IUserValidationService } from '../../domain/services/user-validation.service.js';
import { Screening } from '../../domain/entities/screening.entity.js';

export class ApplyScreeningUseCase {
  constructor(
    private readonly screeningRepository: IScreeningRepository,
    private readonly userValidationService: IUserValidationService
  ) {}

  async execute(userId: string): Promise<Screening> {
    if (!userId) {
      throw new Error('UserId is required');
    }

    const userExists = await this.userValidationService.validateUserExists(userId);
    if (!userExists) {
      throw new Error(`User not found: ${userId}`);
    }

    return await this.screeningRepository.create(userId);
  }
}
