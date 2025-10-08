export interface IEventPublisher {
  publish(eventName: string, data: any): Promise<void>;
}

export class ScreeningPassedEvent {
  constructor(public readonly userId: string) {}
}
