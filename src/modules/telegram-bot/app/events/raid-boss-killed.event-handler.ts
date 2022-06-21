import * as dayjs from 'dayjs';
import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { RaidBossKilled } from '@modules/raid-bosses/domain/events/raid-boss-killed/raid-boss-killed.event';
import { GetRaidBossById } from '@modules/raid-bosses/app/queries/get-raid-boss-by-id/get-raid-boss-by-id.query';
import { RaidBossDto } from '@modules/raid-bosses/infra/dto/raid-boss.dto';
import { UserRepository } from '../../infra/repositories/user.repository';
import { UserReadDto } from '../../infra/dto/user-read.dto';
import { BotUpdate } from '../../bot/bot.update';

@EventsHandler(RaidBossKilled)
export class RaidBossKilledHandler implements IEventHandler<RaidBossKilled> {
  private readonly logger = new Logger(RaidBossKilledHandler.name);

  constructor(
    private readonly repository: UserRepository,
    private readonly queryBus: QueryBus,
    private readonly botUpdate: BotUpdate,
  ) {}

  async handle(event: RaidBossKilled) {
    this.logger.log(`RaidBossKilledHandler: (event): ${JSON.stringify(event)}`);

    const raidBossResult: Result<RaidBossDto> = await this.queryBus.execute(
      new GetRaidBossById({ raidBossId: event.id }),
    );

    this.logger.log(`RaidBossKilledHandler: (raidBossResult): ${JSON.stringify(raidBossResult)}`);

    if (raidBossResult.isFailure) {
      return;
    }

    const raidBoss = raidBossResult.getValue();

    if (
      dayjs(raidBoss.killDate).valueOf() <=
      dayjs().subtract(5, 'minute').valueOf()
    ) {
      this.logger.log(`RaidBossKilledHandler: (outdated)`);
      return;
    }

    const users: UserReadDto[] = await this.repository.findUsersByRaidBossId(
      raidBoss.id,
    );

    this.logger.log(`RaidBossKilledHandler: (notify): ${JSON.stringify(raidBossResult)} ${JSON.stringify(users)}`);

    this.botUpdate.notifyBossKilled(
      raidBoss,
      users.map((user) => parseInt(user._id, 10)),
    );
  }
}
