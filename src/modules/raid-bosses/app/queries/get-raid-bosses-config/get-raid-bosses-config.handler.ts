import { Logger } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { RaidBossConfigDto } from '@shared/dto/raid-boss-config.dto';
import { Result } from '@shared/domain/utils';
import { Server } from '../../../domain/value-objects/server.value-object';
import { RaidBossConfigRepository } from '../../../infra/repositories/raid-boss-config.repository';
import { GetRaidBossesConfig } from './get-raid-bosses-config.query';

@QueryHandler(GetRaidBossesConfig)
export class GetRaidBossesConfigHandler
  implements IQueryHandler<GetRaidBossesConfig>
{
  private readonly logger = new Logger(GetRaidBossesConfigHandler.name);

  constructor(private readonly repository: RaidBossConfigRepository) {}

  async execute(
    query: GetRaidBossesConfig,
  ): Promise<Result<RaidBossConfigDto | RaidBossConfigDto[]>> {
    this.logger.debug(`GetRaidBossesConfig: ${JSON.stringify(query)}`);

    const { project, server, raidBoss } = query;

    try {
      if (!project || !server || !raidBoss) {
        const raidBossData = await this.repository.getRaidBosses();

        return Result.ok(raidBossData);
      }

      new Server({ project, server }); // server validation

      const raidBossData = await this.repository.findRaidBossByProps(
        project,
        server,
        raidBoss,
      );

      if (!raidBossData) {
        return Result.fail(
          `Cannot find raid boss for ${project} ${server} ${raidBoss}`,
        );
      }

      return Result.ok(raidBossData);
    } catch (e) {
      this.logger.error(e);
      return Result.fail(e.message);
    }
  }
}
