import { RaidBossDto } from '@modules/raid-bosses/infra/dto/raid-boss.dto';
import { Logger } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { Respawn } from '../../../domain/value-objects/respawn.value-object';
import { RaidBossRepository } from '../../../infra/repositories/raid-boss.repository';
import { RespawnNumbers } from '../../../services/respawn-numbers.service';
import { GetRaidBosses } from './get-raid-bosses.query';

@QueryHandler(GetRaidBosses)
export class GetRaidBossesHandler implements IQueryHandler<GetRaidBosses> {
  private readonly logger = new Logger(GetRaidBossesHandler.name);

  constructor(private readonly repository: RaidBossRepository) {}

  async execute(query: GetRaidBosses): Promise<Result<RaidBossDto[]>> {
    this.logger.debug(`GetRaidBosses: ${JSON.stringify(query)}`);

    const { project, server } = query;

    try {
      const raidBossesData = await this.repository.getRaidBossesReadData(
        project,
        server,
      );

      const result: RaidBossDto[] = raidBossesData.map((raidBossData) => {
        const respawn = new Respawn({
          killDate: raidBossData.killDate,
          min: raidBossData.min,
          max: raidBossData.max,
        });
        const respawnNumbers = new RespawnNumbers(respawn);

        return {
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
      });

      return Result.ok(result);
    } catch (e) {
      this.logger.error(e);
      return Result.fail(e.message);
    }
  }
}
