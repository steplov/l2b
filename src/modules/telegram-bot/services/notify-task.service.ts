import * as dayjs from 'dayjs';
import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Interval } from '@nestjs/schedule';
import { Result } from '@shared/domain/utils';
import { RaidBossDto } from '@modules/raid-bosses/infra/dto/raid-boss.dto';
import { GetRaidBosses } from '@modules/raid-bosses/app/queries/get-raid-bosses/get-raid-bosses.query';
import { UserReadRepository } from '../infra/repositories/user-read.repository';
import { UserReadDto } from '../infra/dto/user-read.dto';
import { BotUpdate } from '../bot/bot.update';

const interval = 120;

@Injectable()
export class NotifyTaskService {
  private readonly logger = new Logger(NotifyTaskService.name);

  constructor(
    private readonly readRepository: UserReadRepository,
    private readonly queryBus: QueryBus,
    private readonly botUpdate: BotUpdate,
  ) {}

  @Interval(interval * 1000)
  async handleInterval() {
    this.logger.debug('Asterios max respawn notifier');
    const raidBossesResult: Result<RaidBossDto[]> = await this.queryBus.execute(
      new GetRaidBosses({}),
    );

    await this.execute(raidBossesResult.getValue(), 3);
    await this.execute(raidBossesResult.getValue(), 1);
  }

  private async execute(raidBosses, hours: number) {
    const filteredBosses = this.filter(raidBosses, hours);

    console.log('filteredBosses', filteredBosses);

    if (filteredBosses.length) {
      for await (const raidBoss of filteredBosses) {
        const users: UserReadDto[] =
          await this.readRepository.findUsersByRaidBossId(raidBoss.id);

        await this.botUpdate.notifyTimeBeforeMaxSpawn(
          raidBoss,
          users.map((u) => parseInt(u._id, 10)),
          hours,
        );
      }
    }
  }

  private filter(raidBosses, hours: number) {
    const date = dayjs().add(hours, 'hour');
    const min = date.subtract(interval / 2, 'seconds').valueOf();
    const max = date.add(interval / 2, 'seconds').valueOf();

    return raidBosses.filter((rb) => {
      const maxSpawn = rb.max.getTime();

      return maxSpawn > min && maxSpawn <= max;
    });
  }
}