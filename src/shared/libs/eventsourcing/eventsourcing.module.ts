import { Module, DynamicModule, Provider, Type } from '@nestjs/common';
import {
  EventSourcingOptions,
  EventSourcingAsyncOptions,
  EventSourcingOptionsFactory,
} from './interfaces';
import { CqrsModule } from '@nestjs/cqrs';
import { defer, lastValueFrom } from 'rxjs';
import { EventStore } from './eventstore';
import { createEventSourcingProviders } from './eventsourcing.providers';

const EVENTSOURCING_MODULE_OPTIONS = 'EVENTSOURCING_MODULE_OPTIONS';

@Module({})
export class EventSourcingModule {
  static forRoot(options: EventSourcingOptions): DynamicModule {
    const eventStoreProvider = {
      provide: EventStore,
      useFactory: async (): Promise<any> =>
        await lastValueFrom(
          defer(async () => {
            return new EventStore(options);
          }),
        ),
    };
    return {
      module: EventSourcingModule,
      providers: [eventStoreProvider],
      exports: [EventStore],
      global: true,
    };
  }

  static forRootAsync(options: EventSourcingAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);
    const eventStoreProvider = {
      provide: EventStore,
      useFactory: async (options: EventSourcingOptions): Promise<any> =>
        await lastValueFrom(
          defer(async () => {
            return new EventStore(options);
          }),
        ),
      inject: [EVENTSOURCING_MODULE_OPTIONS],
    };

    return {
      module: EventSourcingModule,
      providers: [...asyncProviders, eventStoreProvider],
      exports: [EventStore],
      global: true,
    };
  }

  static forFeature(): DynamicModule {
    const providers = createEventSourcingProviders();
    return {
      module: EventSourcingModule,
      imports: [CqrsModule],
      providers: providers,
      exports: providers,
    };
  }

  private static createAsyncProviders(
    options: EventSourcingAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<EventSourcingOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: EventSourcingAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: EVENTSOURCING_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass ||
        options.useExisting) as Type<EventSourcingOptionsFactory>,
    ];
    return {
      provide: EVENTSOURCING_MODULE_OPTIONS,
      useFactory: async (optionsFactory: EventSourcingOptionsFactory) =>
        await optionsFactory.createEventSourcingOptions(),
      inject,
    };
  }
}
