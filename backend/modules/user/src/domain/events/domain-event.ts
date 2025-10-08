export interface DomainEvent {
  eventName: string;
  occurredOn: Date;
  data: any;
}

export class ScreeningPassedEvent implements DomainEvent {
  eventName = 'screening.passed';
  occurredOn: Date;

  constructor(public readonly data: { userId: string }) {
    this.occurredOn = new Date();
  }
}
