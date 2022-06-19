import * as dayjs from 'dayjs';
import { EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { RaidBossKilled } from '@modules/raid-bosses/domain/events/raid-boss-killed/raid-boss-killed.event';
import { GetRaidBossById } from '@modules/raid-bosses/app/queries/get-raid-boss-by-id/get-raid-boss-by-id.query';
import { RaidBossDto } from '@modules/raid-bosses/infra/dto/raid-boss.dto';
import { UserReadRepository } from '../../infra/repositories/user-read.repository';
import { UserReadDto } from '../../infra/dto/user-read.dto';
import { BotUpdate } from '../../bot/bot.update';

@EventsHandler(RaidBossKilled)
export class RaidBossKilledHandler implements IEventHandler<RaidBossKilled> {
  constructor(
    private readonly readRepository: UserReadRepository,
    private readonly queryBus: QueryBus,
    private readonly botUpdate: BotUpdate,
  ) {}

  async handle(event: RaidBossKilled) {
    const raidBossResult: Result<RaidBossDto> = await this.queryBus.execute(
      new GetRaidBossById({ raidBossId: event.id }),
    );

    if (raidBossResult.isFailure) {
      return;
    }

    const raidBoss = raidBossResult.getValue();

    if (
      dayjs(raidBoss.killDate).valueOf() <=
      dayjs().subtract(5, 'minute').valueOf()
    ) {
      return;
    }

    const users: UserReadDto[] =
      await this.readRepository.findUsersByRaidBossId(raidBoss.id);

    this.botUpdate.notifyBossKilled(
      raidBoss,
      users.map((user) => parseInt(user._id, 10)),
    );
  }
}
