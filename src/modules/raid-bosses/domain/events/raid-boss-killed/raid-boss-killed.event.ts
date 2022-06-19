import { StorableEvent } from '@shared/libs/eventsourcing';
import {
  Respawn,
  RespawnProps,
} from '../../value-objects/respawn.value-object';

export class RaidBossKilled extends StorableEvent {
  eventAggregate = 'raidBoss';
  eventVersion = 1;

  respawn: RespawnProps;

  constructor(
    public readonly id: string,
    killDate: Date,
    min: Date,
    max: Date,
  ) {
    super();

    this.respawn = new Respawn({
      killDate,
      min,
      max,
    }).unpack();
  }
}
