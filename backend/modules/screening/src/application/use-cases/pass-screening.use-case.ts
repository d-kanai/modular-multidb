import { IScreeningRepository } from '../../domain/repositories/screening.repository.js';
import { IEventPublisher } from '../../domain/events/screening-passed.event.js';
import { Screening } from '../../domain/entities/screening.entity.js';

export class PassScreeningUseCase {
  constructor(
    private readonly screeningRepository: IScreeningRepository,
    private readonly eventPublisher: IEventPublisher
  ) {}

  async execute(screeningId: string): Promise<Screening> {
    const screening = await this.screeningRepository.findById(screeningId);

    if (!screening) {
      throw new Error(`Screening not found: ${screeningId}`);
    }

    screening.pass();

    const updatedScreening = await this.screeningRepository.update(screening);

    // Publish event to notify user module
    await this.eventPublisher.publish('screening.passed', { userId: screening.userId });

    return updatedScreening;
  }
}
