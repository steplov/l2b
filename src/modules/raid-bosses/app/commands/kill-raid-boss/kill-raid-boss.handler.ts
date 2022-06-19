import { RaidBossConfigRepository } from '@modules/raid-bosses/infra/repositories/raid-boss-config.repository';
import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { StoreEventPublisher } from '@shared/libs/eventsourcing';
import { Server } from '../../../domain/value-objects/server.value-object';
import { RaidBossRepository } from '../../../infra/repositories/raid-boss.repository';
import { RespawnPredictor } from '../../../services/respawn-predictor.service';
import { KillRaidBoss } from './kill-raid-boss.command';

@CommandHandler(KillRaidBoss)
export class KillRaidBossHandler implements ICommandHandler<KillRaidBoss> {
  private readonly logger = new Logger(KillRaidBossHandler.name);

  constructor(
    private readonly repository: RaidBossRepository,
    private readonly configRepository: RaidBossConfigRepository,
    private readonly publisher: StoreEventPublisher,
    private readonly respawnPredictor: RespawnPredictor,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: KillRaidBoss) {
    this.logger.debug(`KillRaidBoss: ${JSON.stringify(command)}`);

    const { project, server, raidBoss, killDate } = command;

    try {
      new Server({ project, server }); // server validation

      const raidBossResponse = await this.configRepository.findRaidBossByProps(
        project,
        server,
        raidBoss,
      );

      if (!raidBossResponse) {
        throw new Error(
          `Cannot find RaidBoss by props: ${project}, ${server}, ${raidBoss}`,
        );
      }

      const raidBossId = raidBossResponse.id;

      const raidBossAggregate = this.publisher.mergeObjectContext(
        await this.repository.findOneById(raidBossId),
      );

      if (
        raidBossId === raidBossAggregate.raidBoss.id &&
        command.killDate.getTime() <=
          raidBossAggregate.raidBoss.respawn.killDate.getTime()
      ) {
        return;
      }

      const { min, max } = this.respawnPredictor.predict({
        project,
        server,
        raidBoss,
        killDate,
      });

      raidBossAggregate.kill(killDate, min, max);
      raidBossAggregate.commit();

      return Result.ok(raidBossId);
    } catch (e) {
      this.logger.error(e);
      return Result.fail(e.message);
    }
  }
}
