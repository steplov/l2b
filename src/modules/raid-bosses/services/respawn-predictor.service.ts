import { Injectable, Logger } from '@nestjs/common';
import { NotFoundException } from '@shared/exceptions';
import { RespawnTime } from '@shared/services/respawn-predictor-service';
import { Project, RaidBoss, ServerTuple } from '@shared/config';
import { AsteriosRespawnPredictorService } from '@modules/asterios-server/services/asterios-respawn-predictor-service';
import { Respawn } from '../domain/value-objects/respawn.value-object';

interface PredictProps {
  project: Project;
  server: ServerTuple;
  raidBoss: RaidBoss;
  killDate: Date;
}

@Injectable()
export class RespawnPredictor {
  private readonly logger = new Logger(RespawnPredictor.name);

  constructor(
    private readonly asteriosRespawnPredictor: AsteriosRespawnPredictorService,
  ) {}

  predict(predictProps: PredictProps): Respawn {
    this.logger.debug('Calculate respawn');

    const { project, server, raidBoss, killDate } = predictProps;
    let timings;

    switch (project) {
      case Project.Asterios:
        timings = this.asteriosRespawnPredictor.getTimings(server, raidBoss);
        break;

      default:
        throw new NotFoundException(`Cannot find timings for ${raidBoss}`);
    }

    return this.calculate(killDate, timings);
  }

  private calculate(killDate: Date, respawnTime: RespawnTime) {
    const min = this.addHours(killDate, respawnTime.respawn - respawnTime.min);
    const max = this.addHours(killDate, respawnTime.respawn + respawnTime.max);

    return new Respawn({
      killDate,
      min,
      max,
    });
  }

  private addHours(date: Date, hours: number): Date {
    const newDate = date.getTime() + hours * 60 * 60 * 1000;
    return new Date(newDate);
  }
}
