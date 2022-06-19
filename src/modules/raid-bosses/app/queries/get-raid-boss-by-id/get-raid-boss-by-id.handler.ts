import { Logger } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { NotFoundException } from '@shared/exceptions';
import { Respawn } from '../../../domain/value-objects/respawn.value-object';
import { RaidBossDto } from '../../../infra/dto/raid-boss.dto';
import { RaidBossRepository } from '../../../infra/repositories/raid-boss.repository';
import { RespawnNumbers } from '../../../services/respawn-numbers.service';
import { GetRaidBossById } from './get-raid-boss-by-id.query';

@QueryHandler(GetRaidBossById)
export class GetRaidBossByIdHandler implements IQueryHandler<GetRaidBossById> {
  private readonly logger = new Logger(GetRaidBossByIdHandler.name);

  constructor(private readonly repository: RaidBossRepository) {}

  async execute(query: GetRaidBossById): Promise<Result<RaidBossDto>> {
    this.logger.debug(`GetRaidBossById: ${JSON.stringify(query)}`);

    const { raidBossId } = query;

    try {
      const raidBossData = await this.repository.getRaidBossReadDataById(
        raidBossId,
      );

      if (!raidBossData) {
        throw new NotFoundException(`Cannot find raid boss for ${raidBossId}`);
      }

      const respawn = new Respawn({
        killDate: raidBossData.killDate,
        min: raidBossData.min,
        max: raidBossData.max,
      });

      const respawnNumbers = new RespawnNumbers(respawn);

      const raidBossDto: RaidBossDto = {
        id: raidBossData._id,
        raidBoss: raidBossData.raidBoss,
        server: raidBossData.server,
        project: raidBossData.project,
        killDate: raidBossData.killDate,
        min: raidBossData.min,
        max: raidBossData.max,
        respawnDuration: respawnNumbers.getRespawnDuration(),
        respawnLeft: respawnNumbers.getRespawnLeft(),
        startsIn: respawnNumbers.getRespawnStartsIn(),
      };

      return Result.ok(raidBossDto);
    } catch (e) {
      this.logger.error(e);
      return Result.fail(e.message);
    }
  }
}
