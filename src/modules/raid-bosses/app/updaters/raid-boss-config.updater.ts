import { Logger } from '@nestjs/common';
import { IViewUpdater, ViewUpdaterHandler } from '@shared/libs/eventsourcing';
import { RaidBossConfigRepository } from '../../infra/repositories/raid-boss-config.repository';
import { RaidBossConfigUpdated } from '../../domain/events/raid-boss-config-updated/raid-boss-config-updated.event';

@ViewUpdaterHandler(RaidBossConfigUpdated)
export class RaidBossConfigUpdater
  implements IViewUpdater<RaidBossConfigUpdated>
{
  private logger = new Logger(RaidBossConfigUpdater.name);

  constructor(private readonly repository: RaidBossConfigRepository) {}

  async handle() {
    this.logger.log('RaidBossConfigUpdater');

    const raidBossAggregate = await this.repository.findAggregate();

    this.repository.saveRaidBossToRead(
      raidBossAggregate.raidBosses.map((rb) => rb.unpack()),
    );
  }
}
