import * as dayjs from 'dayjs';
import { Logger } from '@nestjs/common';
import { Respawn } from '../domain/value-objects/respawn.value-object';

export class RespawnNumbers {
  private readonly logger = new Logger(RespawnNumbers.name);

  constructor(private readonly respawn: Respawn) {}

  getRespawnStartsIn(): string | undefined {
    const now = dayjs();
    const min = dayjs(this.respawn.min);

    const startsIn = min.diff(now);

    if (startsIn < 0) return undefined;

    return this.msToMinutes(startsIn);
  }

  getRespawnLeft(): string | undefined {
    const startsIn = this.getRespawnStartsIn();

    if (startsIn !== undefined) return undefined;

    const now = dayjs();
    const max = dayjs(this.respawn.max);
    const diff = max.diff(now);

    if (diff < 0) {
      return undefined;
    }

    return this.msToMinutes(diff);
  }

  getRespawnDuration(): string | undefined {
    const startsIn = this.getRespawnStartsIn();

    if (startsIn !== undefined) return undefined;

    const now = dayjs();
    const min = dayjs(this.respawn.min);

    const diff = now.diff(min);

    return this.msToMinutes(diff);
  }

  private msToMinutes(ms: number) {
    const date = dayjs(ms);

    return date
      .add((date as any).$d.getTimezoneOffset(), 'minute')
      .format('HH:mm:ss');
  }
}
