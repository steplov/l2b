import { StorableEvent } from '@shared/libs/eventsourcing';

export class UserCreated extends StorableEvent {
  eventAggregate = 'telegramUser';
  eventVersion = 1;

  constructor(
    public readonly id: string,
    public readonly languageCode: string,
  ) {
    super();
  }
}
