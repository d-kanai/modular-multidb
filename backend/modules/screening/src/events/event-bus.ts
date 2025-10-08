type EventHandler = (data: any) => void | Promise<void>;

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  subscribe(eventName: string, handler: EventHandler) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  async publish(eventName: string, data: any) {
    const handlers = this.handlers.get(eventName) || [];
    await Promise.all(handlers.map(handler => handler(data)));
  }
}

export const eventBus = new EventBus();
