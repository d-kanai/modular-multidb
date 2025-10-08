import { IScreeningRepository } from '../../domain/repositories/screening.repository.js';
import { Screening } from '../../domain/entities/screening.entity.js';
import { UserApiClient } from '../../infrastructure/external/user-api.client.js';

export class ApplyScreeningUseCase {
  constructor(
    private readonly screeningRepository: IScreeningRepository,
    private readonly userApiClient: UserApiClient
  ) {}

  async execute(userId: string): Promise<Screening> {
    // Fetch user information from User Module
    const user = await this.userApiClient.getUser(userId);

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Entity factory creates screening with domain event and user snapshot
    const screening = Screening.apply(userId, user.name);

    // Save screening
    const savedScreening = await this.screeningRepository.save(screening);

    // Domain events are automatically included in the entity
    return savedScreening;
  }
}
