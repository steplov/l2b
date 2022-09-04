import { Injectable } from '@nestjs/common';
import { RespawnPredictorService, Timings } from '@shared/services/respawn-predictor-service';
import { RaidBoss, AsteriosServer } from '@shared/config';

const rbTime = {
  respawn: 24,
  min: 6,
  max: 6,
};
const respawnTime = {
  [RaidBoss.Cabrio]: rbTime,
  [RaidBoss.Golkonda]: rbTime,
  [RaidBoss.Hallate]: rbTime,
  [RaidBoss.Kernon]: rbTime,
};

@Injectable()
export class AsteriosRespawnPredictorService extends RespawnPredictorService<AsteriosServer> {
  readonly timings: Timings<AsteriosServer>;

  constructor() {
    super();

    this.timings = {
      ...Object.values(AsteriosServer).reduce((acc, server) => {
        acc[server] = respawnTime;
  
        return acc;
      }, {} as Timings<AsteriosServer>)
    }
  }
}
