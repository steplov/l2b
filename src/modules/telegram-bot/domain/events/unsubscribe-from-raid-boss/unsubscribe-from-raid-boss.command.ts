import { StorableEvent } from '@shared/libs/eventsourcing';

export class UserUnsubscribedFromRaidBoss extends StorableEvent {
  eventAggregate = 'telegramUser';
  eventVersion = 1;

  constructor(
    public readonly id: string,
    public readonly subscriptions: string[],
  ) {
    super();
  }
}
