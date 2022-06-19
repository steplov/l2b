import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { UUID } from '@shared/domain/value-objects';
import { StoreEventPublisher } from '@shared/libs/eventsourcing';
import { Project, servers, RaidBoss } from '@shared/config';
import { RaidBossConfigRepository } from '../../../infra/repositories/raid-boss-config.repository';
import { GenerateConfig } from './generate-config.command';

@CommandHandler(GenerateConfig)
export class GenerateConfigHandler implements ICommandHandler<GenerateConfig> {
  private readonly logger = new Logger(GenerateConfig.name);

  constructor(
    private readonly repository: RaidBossConfigRepository,
    private readonly publisher: StoreEventPublisher,
  ) {}

  async execute() {
    this.logger.debug(`GenerateConfig`);

    try {
      const raidBossConfigAggregate = this.publisher.mergeObjectContext(
        await this.repository.findAggregate(),
      );
      const bosses = [];

      Object.values(Project).forEach((project) => {
        Object.values(servers[project]).forEach((server) => {
          Object.values(RaidBoss).forEach((raidBoss) => {
            const comparator = (rb) =>
              rb.project === project &&
              rb.server === server &&
              rb.raidBoss === raidBoss;
            if (!raidBossConfigAggregate.raidBosses.some(comparator)) {
              bosses.push({
                id: UUID.generate().value,
                project,
                server,
                raidBoss,
              });
            }
          });
        });
      });

      if (bosses.length) {
        this.logger.log(
          `Adding new bosses: ${JSON.stringify(
            bosses.map((b) => `${b.project}-${b.server}-${b.raidBoss}`),
          )}`,
        );

        raidBossConfigAggregate.update({
          raidBosses: [...raidBossConfigAggregate.raidBosses, ...bosses],
        });
        raidBossConfigAggregate.commit();
      }

      return Result.ok(raidBossConfigAggregate);
    } catch (e) {
      this.logger.error(e);
      return Result.fail(e.message);
    }
  }
}
