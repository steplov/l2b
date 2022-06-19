import { RaidBossDto } from '@modules/raid-bosses/infra/dto/raid-boss.dto';
import { Logger } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { NotFoundException } from '@shared/exceptions';
import { Respawn } from '../../../domain/value-objects/respawn.value-object';
import { Server } from '../../../domain/value-objects/server.value-object';
import { RaidBossRepository } from '../../../infra/repositories/raid-boss.repository';
import { RaidBossConfigRepository } from '../../../infra/repositories/raid-boss-config.repository';
import { RespawnNumbers } from '../../../services/respawn-numbers.service';
import { GetRaidBoss } from './get-raid-boss.query';

@QueryHandler(GetRaidBoss)
export class GetRaidBossHandler implements IQueryHandler<GetRaidBoss> {
  private readonly logger = new Logger(GetRaidBossHandler.name);

  constructor(
    private readonly repository: RaidBossRepository,
    private readonly configRepository: RaidBossConfigRepository,
  ) {}

  async execute(query: GetRaidBoss): Promise<Result<RaidBossDto>> {
    this.logger.debug(`GetRaidBoss: ${JSON.stringify(query)}`);

    const { project, server, raidBoss } = query;

    try {
      new Server({ project, server }); // server validation

      const { id: raidBossId } =
        await this.configRepository.findRaidBossByProps(
          project,
          server,
          raidBoss,
        );
      const raidBossData = await this.repository.getRaidBossReadDataById(
        raidBossId,
      );

      if (!raidBossData) {
        throw new NotFoundException(`Cannot find raid boss for ${raidBoss}`);
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
