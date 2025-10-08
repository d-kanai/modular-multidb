import { IScreeningRepository } from '../../domain/repositories/screening.repository.js';
import { IEventPublisher } from '../../domain/events/screening-passed.event.js';
import { Screening } from '../../domain/entities/screening.entity.js';

export class PassScreeningUseCase {
  constructor(
    private readonly screeningRepository: IScreeningRepository,
    private readonly eventPublisher: IEventPublisher
  ) {}

  async execute(screeningId: string): Promise<Screening> {
    // Load screening
    const screening = await this.screeningRepository.findById(screeningId);

    if (!screening) {
      throw new Error(`Screening not found: ${screeningId}`);
    }

    // State transition (generates domain event internally)
    screening.pass();

    console.log('[PassScreeningUseCase] Domain events after pass():', screening.getDomainEvents());

    // Update screening
    const updatedScreening = await this.screeningRepository.update(screening);

    console.log('[PassScreeningUseCase] Domain events after update():', updatedScreening.getDomainEvents());

    // Publish domain events
    const domainEvents = updatedScreening.getDomainEvents();
    console.log('[PassScreeningUseCase] Publishing', domainEvents.length, 'events');
    for (const event of domainEvents) {
      await this.eventPublisher.publish(event.eventName, event.data);
    }

    // Clear events after publishing
    updatedScreening.clearDomainEvents();

    return updatedScreening;
  }
}
