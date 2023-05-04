import { AggregateRoot, IEvent, EventBus } from '@nestjs/cqrs';

export class Aggregate extends AggregateRoot {
  constructor(private readonly eventBus: EventBus) {
    super();
  }

  publish(event: IEvent) {
    this.eventBus.publish(event);
  }
  publishAll(events: IEvent[]) {
    this.eventBus.publishAll(events);
  }
}
