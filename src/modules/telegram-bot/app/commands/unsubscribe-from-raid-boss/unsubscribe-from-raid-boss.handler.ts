import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { StoreEventPublisher } from '@shared/libs/eventsourcing';
import { RaidBossConfigDto } from '@shared/dto/raid-boss-config.dto';
import { GetRaidBossesConfig } from '@modules/raid-bosses/app/queries/get-raid-bosses-config/get-raid-bosses-config.query';
import { UserRepository } from '../../../infra/repositories/user.repository';
import { UnsubscribeFromRaidBoss } from './unsubscribe-from-raid-boss.command';

@CommandHandler(UnsubscribeFromRaidBoss)
export class UnsubscribeFromRaidBossHandler
  implements ICommandHandler<UnsubscribeFromRaidBoss>
{
  private readonly logger = new Logger(UnsubscribeFromRaidBossHandler.name);

  constructor(
    private readonly repository: UserRepository,
    private readonly publisher: StoreEventPublisher,
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
      const telegramUserAggregate = this.publisher.mergeObjectContext(
        await this.repository.findOneById(command.userId),
      );

      telegramUserAggregate.unsubscribe(raidResult.getValue().id);
      telegramUserAggregate.commit();

      return Result.ok(telegramUserAggregate.user.subscriptions);
    } catch (e) {
      this.logger.error(e);
      return Result.fail(e.message);
    }
  }
}
