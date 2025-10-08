import { IScreeningRepository } from '../../domain/repositories/screening.repository.js';
import { Screening } from '../../domain/entities/screening.entity.js';

export class ApplyScreeningUseCase {
  constructor(private readonly screeningRepository: IScreeningRepository) {}

  async execute(userId: string): Promise<Screening> {
    // Entity factory creates screening with domain event
    const screening = Screening.apply(userId);

    // Save screening
    const savedScreening = await this.screeningRepository.save(screening);

    // Domain events are automatically included in the entity
    return savedScreening;
  }
}
