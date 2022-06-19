import { StorableEvent } from '@shared/libs/eventsourcing';

export class UserSubscribedOnRaidBoss extends StorableEvent {
  eventAggregate = 'telegramUser';
  eventVersion = 1;

  constructor(
    public readonly id: string,
    public readonly subscriptions: string[],
  ) {
    super();
  }
}
