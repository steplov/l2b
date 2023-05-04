import { EventBus } from '@nestjs/cqrs';
import { Aggregate } from '@shared/domain/base-classes/aggregate';
import { TelegramUserEntity } from './telegram-user.entity';
import { UserCreated } from '../events/user-created/user-created.event';
import { UserSubscribedOnRaidBoss } from '../events/user-subscribed-on-raid-boss/user-subscribed-on-raid-boss.event';
import { UserUnsubscribedFromRaidBoss } from '../events/unsubscribe-from-raid-boss/unsubscribe-from-raid-boss.command';
import { UserSettingsUpdated } from '../events/user-settings-updated/user-settings-updated.event';

export interface TelegramUserAggregateProps {
  languageCode?: string;
  subscriptions?: string[];
}

export class TelegramUserAggregate extends Aggregate {
  user: TelegramUserEntity;

  constructor(
    eventBus: EventBus,
    props: TelegramUserAggregateProps,
    public readonly id: string,
  ) {
    super(eventBus);

    this.user = new TelegramUserEntity(
      {
        languageCode: props.languageCode || 'en',
        subscriptions: props.subscriptions || [],
      },
      id,
    );
  }

  create(languageCode: string) {
    this.apply(new UserCreated(this.user.id, languageCode));
  }

  updateSettings(languageCode: string) {
    this.apply(new UserSettingsUpdated(this.user.id, languageCode));
  }

  subscribe(raidBossId: string) {
    this.apply(
      new UserSubscribedOnRaidBoss(this.user.id, [
        ...this.user.subscriptions,
        raidBossId,
      ]),
    );
  }

  unsubscribe(raidBossId: string) {
    const subscriptions = this.user.subscriptions.filter(
      (s) => s !== raidBossId,
    );
    this.apply(new UserUnsubscribedFromRaidBoss(this.user.id, subscriptions));
  }

  onUserCreated(event: UserCreated) {
    const { languageCode } = event;

    this.user = new TelegramUserEntity(
      {
        languageCode,
        subscriptions: [],
      },
      this.user.id,
    );
  }

  onUserSettingsUpdated(event: UserSettingsUpdated) {
    this.user = new TelegramUserEntity(
      {
        languageCode: event.languageCode,
        subscriptions: this.user.subscriptions,
      },
      this.user.id,
    );
  }

  onUserSubscribedOnRaidBoss(event: UserSubscribedOnRaidBoss) {
    this.user = new TelegramUserEntity(
      {
        languageCode: this.user.languageCode,
        subscriptions: event.subscriptions,
      },
      this.user.id,
    );
  }

  onUserUnsubscribedFromRaidBoss(event: UserUnsubscribedFromRaidBoss) {
    this.user = new TelegramUserEntity(
      {
        languageCode: this.user.languageCode,
        subscriptions: event.subscriptions,
      },
      this.user.id,
    );
  }
}
