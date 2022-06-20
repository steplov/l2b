import { Event } from '@shared/domain/base-classes/event';
import {
  Respawn,
  RespawnProps,
} from '../../value-objects/respawn.value-object';

export class RaidBossKilled extends Event {
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
