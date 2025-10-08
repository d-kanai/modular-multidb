export enum DomainEventName {
  SCREENING_APPLIED = 'screening.applied',
  SCREENING_PASSED = 'screening.passed',
  SCREENING_REJECTED = 'screening.rejected',
}

export interface DomainEvent {
  eventName: DomainEventName;
  occurredOn: Date;
  data: any;
}
