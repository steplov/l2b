import { ServerTuple, RaidBoss } from '../config';

export interface RespawnTime {
  respawn: number;
  min: number;
  max: number;
}

type Timings<S extends string> = Record<S, Record<RaidBoss, RespawnTime>>;

export abstract class RespawnPredictorService<S extends string> {
  abstract readonly timings: Timings<S>;

  getTimings(server: ServerTuple, raidBoss: RaidBoss): RespawnTime {
    return this.timings[server][raidBoss];
  }
}
