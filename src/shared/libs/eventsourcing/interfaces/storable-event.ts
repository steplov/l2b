import { IEvent } from '@nestjs/cqrs';

export interface IEventMeta {
  revision: number;
}

export abstract class StorableEvent implements IEvent {
  abstract id: string;
  abstract eventAggregate: string;
  abstract eventVersion: number;
  eventName: string;

  readonly meta: IEventMeta;

  constructor() {
    this.eventName = this.constructor.name;
  }
}
