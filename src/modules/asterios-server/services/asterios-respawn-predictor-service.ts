import { Injectable } from '@nestjs/common';
import { RespawnPredictorService } from '@shared/services/respawn-predictor-service';
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
  readonly timings = {
    [AsteriosServer.Prime]: respawnTime,
    [AsteriosServer.Medea]: respawnTime,
    [AsteriosServer.Asterios]: respawnTime,
    [AsteriosServer.Hunter]: respawnTime,
    [AsteriosServer.Phoenix]: respawnTime,
  };
}
