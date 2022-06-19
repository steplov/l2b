import { ModuleMetadata, Type } from '@nestjs/common';

export interface EventSourcingOptions {
  mongoURL: string;
  maxSnapshots?: number;
  aggregateSnapshot?: { [key: string]: number };
}

export interface EventSourcingOptionsFactory {
  createEventSourcingOptions():
    | Promise<EventSourcingOptions>
    | EventSourcingOptions;
}

export interface EventSourcingAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<EventSourcingOptionsFactory>;
  useClass?: Type<EventSourcingOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<EventSourcingOptions> | EventSourcingOptions;
  inject?: any[];
}
