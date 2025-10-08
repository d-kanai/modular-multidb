import { IEventPublisher } from '../../domain/events/screening-passed.event.js';

const USER_EVENT_URL = 'http://localhost:4000';

export class HttpEventPublisher implements IEventPublisher {
  async publish(eventName: string, data: any): Promise<void> {
    try {
      const response = await fetch(`${USER_EVENT_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventName, data })
      });

      if (!response.ok) {
        console.error('Failed to publish event');
      }
    } catch (error) {
      console.error('Error publishing event:', error);
    }
  }
}
