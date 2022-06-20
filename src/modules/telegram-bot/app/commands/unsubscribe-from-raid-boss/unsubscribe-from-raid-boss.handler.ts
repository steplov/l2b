import { Logger } from '@nestjs/common';
import {
  CommandHandler,
  ICommandHandler,
  QueryBus,
  EventBus,
} from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { RaidBossConfigDto } from '@shared/dto/raid-boss-config.dto';
import { GetRaidBossesConfig } from '@modules/raid-bosses/app/queries/get-raid-bosses-config/get-raid-bosses-config.query';
import {
  TelegramUserAggregate,
  TelegramUserAggregateProps,
} from '../../../domain/entities/telegram-user.aggregate';
import { UserRepository } from '../../../infra/repositories/user.repository';
import { UnsubscribeFromRaidBoss } from './unsubscribe-from-raid-boss.command';

@CommandHandler(UnsubscribeFromRaidBoss)
export class UnsubscribeFromRaidBossHandler
  implements ICommandHandler<UnsubscribeFromRaidBoss>
{
  private readonly logger = new Logger(UnsubscribeFromRaidBossHandler.name);

  constructor(
    private readonly repository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: UnsubscribeFromRaidBoss) {
    this.logger.debug(`UnsubscribeFromRaidBoss: ${JSON.stringify(command)}`);

    const raidResult: Result<RaidBossConfigDto> = await this.queryBus.execute(
      new GetRaidBossesConfig(command),
    );
    if (raidResult.isFailure) {
      return raidResult;
    }

    try {
      const user = await this.repository.findUserById(command.userId);
      const telegramUserAggregate = new TelegramUserAggregate(
        this.eventBus,
        user,
        command.userId,
      );

      telegramUserAggregate.unsubscribe(raidResult.getValue().id);
      this.save(command.userId, telegramUserAggregate);
      telegramUserAggregate.commit();

      return Result.ok(telegramUserAggregate.user.subscriptions);
    } catch (e) {
      this.logger.error(e);
      return Result.fail(e.message);
    }
  }

  async save(id: string, telegramUserAggregate: TelegramUserAggregate) {
    const { subscriptions, languageCode } =
      telegramUserAggregate.user.toObject() as TelegramUserAggregateProps;

    await this.repository.saveUser({
      _id: id,
      subscriptions,
      languageCode,
    });
  }
}
