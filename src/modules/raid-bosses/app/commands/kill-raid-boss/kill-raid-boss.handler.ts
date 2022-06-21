import { RaidBossConfigRepository } from '@modules/raid-bosses/infra/repositories/raid-boss-config.repository';
import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { RaidBossEntityProps } from '../../../domain/entities/raid-boss.entity';
import { Server } from '../../../domain/value-objects/server.value-object';
import { RaidBossAggregate } from '../../../domain/entities/raid-boss.aggregate';
import { RaidBossRepository } from '../../../infra/repositories/raid-boss.repository';
import { RespawnPredictor } from '../../../services/respawn-predictor.service';
import { RaidBoss, Project, ServerTuple } from '@shared/config';
import { KillRaidBoss } from './kill-raid-boss.command';

@CommandHandler(KillRaidBoss)
export class KillRaidBossHandler implements ICommandHandler<KillRaidBoss> {
  private readonly logger = new Logger(KillRaidBossHandler.name);

  constructor(
    private readonly repository: RaidBossRepository,
    private readonly configRepository: RaidBossConfigRepository,
    private readonly respawnPredictor: RespawnPredictor,
    private readonly eventBus: EventBus,
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
      const rb = await this.repository.getRaidBossReadDataById(
        raidBossResponse.id,
      );

      if (!raidBossResponse) {
        throw new Error(
          `Cannot find RaidBoss by props: ${project}, ${server}, ${raidBoss}`,
        );
      }

      let raidBossAggregate: RaidBossAggregate;

      if (rb) {
        raidBossAggregate = new RaidBossAggregate(
          this.eventBus,
          {
            killDate: rb.killDate,
            server: rb.server as ServerTuple,
            project: rb.project as Project,
            raidBoss: rb.raidBoss as RaidBoss,
          },
          raidBossResponse.id,
        );
      } else {
        raidBossAggregate = new RaidBossAggregate(
          this.eventBus,
          {
            killDate,
            server: server as ServerTuple,
            project: project as Project,
            raidBoss: raidBoss as RaidBoss,
          },
          raidBossResponse.id,
        );
      }

      if (
        rb &&
        raidBossResponse.id === raidBossAggregate.raidBoss.id &&
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

      await this.saveRb(raidBossResponse.id, raidBossAggregate);

      raidBossAggregate.commit();

      return Result.ok(raidBossResponse.id);
    } catch (e) {
      this.logger.error(e);
      return Result.fail(e.message);
    }
  }

  async saveRb(id, raidBossAggregate) {
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
