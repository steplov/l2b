import { Event } from '@shared/domain/base-classes/event';

export class UserSubscribedOnRaidBoss extends Event {
  constructor(
    public readonly id: string,
    public readonly subscriptions: string[],
  ) {
    super();
  }
}
