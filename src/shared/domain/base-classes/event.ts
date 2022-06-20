import { IEvent } from '@nestjs/cqrs';

export abstract class Event implements IEvent {
  eventName: string;

  constructor() {
    this.eventName = this.constructor.name;
  }
}
