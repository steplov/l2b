import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { UUID } from '@shared/domain/value-objects';
import { Project, servers, RaidBoss } from '@shared/config';
import { RaidBossConfigRepository } from '../../../infra/repositories/raid-boss-config.repository';
import { GenerateConfig } from './generate-config.command';

@CommandHandler(GenerateConfig)
export class GenerateConfigHandler implements ICommandHandler<GenerateConfig> {
  private readonly logger = new Logger(GenerateConfig.name);

  constructor(private readonly repository: RaidBossConfigRepository) {}

  async execute() {
    this.logger.debug(`GenerateConfig`);

    try {
      const raidBossConfig = await this.repository.getRaidBosses();
      const newBosses = [];

      Object.values(Project).forEach((project) => {
        Object.values(servers[project]).forEach((server) => {
          Object.values(RaidBoss).forEach((raidBoss) => {
            const comparator = (rb) =>
              rb.project === project &&
              rb.server === server &&
              rb.raidBoss === raidBoss;
            if (!raidBossConfig.some(comparator)) {
              newBosses.push({
                id: UUID.generate().value,
                project,
                server,
                raidBoss,
              });
            }
          });
        });
      });

      if (newBosses.length) {
        this.logger.log(
          `Adding new bosses: ${JSON.stringify(
            newBosses.map((b) => `${b.project}-${b.server}-${b.raidBoss}`),
          )}`,
        );

        this.repository.saveRaidBosses([...raidBossConfig, ...newBosses]);
      }

      return Result.ok(newBosses);
    } catch (e) {
      this.logger.error(e);
      return Result.fail(e.message);
    }
  }
}
