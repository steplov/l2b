import { StorableEvent } from '@shared/libs/eventsourcing';

export class UserSettingsUpdated extends StorableEvent {
  eventAggregate = 'telegramUser';
  eventVersion = 1;

  constructor(
    public readonly id: string,
    public readonly languageCode: string,
  ) {
    super();
  }
}
