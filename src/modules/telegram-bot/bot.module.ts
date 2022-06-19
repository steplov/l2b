import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventSourcingModule } from '@shared/libs/eventsourcing';
import { BotUpdate } from './bot/bot.update';
import { RespawnScene } from './bot/scenes/respawn.scene';
import { SubscriptionsScene } from './bot/scenes/subscriptions.scene';
import { SettingsScene } from './bot/scenes/settings.scene';
import { DonateScene } from './bot/scenes/donate.scene';
import { UserRepository } from './infra/repositories/user.repository';
import {
  UserReadRepository,
  getUserReadRepositoryConnection,
} from './infra/repositories/user-read.repository';
import { NotifyHandler } from './app/commands/notify/notify.handler';
import { CreateUserHandler } from './app/commands/create-user/create-user.handler';
import { SubscribeToRaidBossHandler } from './app/commands/subscribe-to-raid-boss/subscribe-to-raid-boss.handler';
import { UpdateUserSettingsHandler } from './app/commands/update-user-settings/update-user-settings.handler';
import { UnsubscribeFromRaidBossHandler } from './app/commands/unsubscribe-from-raid-boss/unsubscribe-from-raid-boss.handler';
import { GetSubscriptionsHandler } from './app/queries/get-subscriptions/get-subscriptions.handler';
import { GetUserHandler } from './app/queries/get-user/get-user.handler';
import { GetUsersHandler } from './app/queries/get-users/get-users.handler';
import { UserCreatedUpdater } from './app/updaters/user-created.updater';
import { UserSubscribedOnRaidBossUpdater } from './app/updaters/user-subscribed-on-raid-boss.updater';
import { UserUnsubscribedFromRaidBossUpdater } from './app/updaters/unsubscribe-from-raid-boss.updater';
import { UserSettingsUpdatedUpdater } from './app/updaters/user-settings.updater';
import { RaidBossKilledHandler } from './app/events/raid-boss-killed.event-handler';
import { NotifyTaskService } from './services/notify-task.service';

const commandHandlers = [
  NotifyHandler,
  CreateUserHandler,
  SubscribeToRaidBossHandler,
  UnsubscribeFromRaidBossHandler,
  UpdateUserSettingsHandler,
];

const stateUpdaters = [
  UserCreatedUpdater,
  UserSubscribedOnRaidBossUpdater,
  UserUnsubscribedFromRaidBossUpdater,
  UserSettingsUpdatedUpdater,
];
const queryHandlers = [
  GetSubscriptionsHandler,
  GetUserHandler,
  GetUsersHandler
];
const eventHandlers = [RaidBossKilledHandler];

export * from './bot/constants';
export * from './bot/middleware/session.middleware';

@Module({
  imports: [
    CqrsModule,
    EventSourcingModule.forFeature(),
    getUserReadRepositoryConnection(),
  ],
  providers: [
    UserRepository,
    UserReadRepository,
    BotUpdate,
    RespawnScene,
    DonateScene,
    SettingsScene,
    SubscriptionsScene,
    NotifyTaskService,
    ...commandHandlers,
    ...queryHandlers,
    ...stateUpdaters,
    ...eventHandlers,
  ],
})
export class BotModule {}
