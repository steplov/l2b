import { ArgumentInvalidException } from '@shared/exceptions';
import { RaidBoss } from '@shared/config';
import { Entity } from '@shared/domain/base-classes';
import { Guard } from '@shared/domain/guard';
import { Server } from '../value-objects/server.value-object';
import { Respawn } from '../value-objects/respawn.value-object';

export interface RaidBossEntityProps {
  server: Server;
  raidBoss: RaidBoss;
  respawn: Respawn;
}

export class RaidBossEntity extends Entity<RaidBossEntityProps> {
  constructor(props: RaidBossEntityProps, id?: string) {
    super(props, id);
  }

  get server() {
    return this.props.server.unpack();
  }

  get raidBoss(): RaidBoss {
    return this.props.raidBoss;
  }

  get respawn() {
    return this.props.respawn.unpack();
  }

  validate(): void {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: this.props.server, argumentName: 'server' },
      { argument: this.props.raidBoss, argumentName: 'raidBoss' },
      { argument: this.props.respawn, argumentName: 'respawn' },
    ]);

    if (!guardResult.succeeded) {
      throw new ArgumentInvalidException(guardResult.message);
    }
  }
}
