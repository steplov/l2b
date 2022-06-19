import { Logger } from '@nestjs/common';
import { IViewUpdater, ViewUpdaterHandler } from '@shared/libs/eventsourcing';
import { RaidBossRepository } from '../../infra/repositories/raid-boss.repository';
import { RaidBossKilled } from '../../domain/events/raid-boss-killed/raid-boss-killed.event';
import { RaidBossEntityProps } from '../../domain/entities/raid-boss.entity';

@ViewUpdaterHandler(RaidBossKilled)
export class RaidBossKilledUpdater implements IViewUpdater<RaidBossKilled> {
  private logger = new Logger(RaidBossKilledUpdater.name);

  constructor(private readonly repository: RaidBossRepository) {}

  async handle(event: RaidBossKilled) {
    this.logger.log('RaidBossKilledUpdater');
    const { id } = event;

    const raidBossAggregate = await this.repository.findOneById(id);

    const {
      raidBoss,
      respawn: { killDate, min, max },
      server: { project, server },
    } = raidBossAggregate.raidBoss.toObject() as RaidBossEntityProps;

    await this.repository.saveToRaidBossRead({
      _id: id,
      raidBoss,
      killDate,
      min,
      max,
      project,
      server,
    });
  }
}
