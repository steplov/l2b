import { AggregateRoot } from '@nestjs/cqrs';
import { RaidBoss, Project, ServerTuple } from '@shared/config';
import { RaidBossEntity } from './raid-boss.entity';
import { Server } from '../value-objects/server.value-object';
import { Respawn } from '../value-objects/respawn.value-object';
import { RaidBossKilled } from '../events/raid-boss-killed/raid-boss-killed.event';

export interface RaidBossAggregateProps {
  raidBoss: RaidBoss;
  project: Project;
  server: ServerTuple;
  killDate: Date;
}

export class RaidBossAggregate extends AggregateRoot {
  raidBoss: RaidBossEntity;

  constructor(props: RaidBossAggregateProps, public readonly id: string) {
    super();

    const server = new Server({
      project: props.project,
      server: props.server,
    });

    const respawn = new Respawn({
      killDate: props.killDate,
      min: props.killDate,
      max: props.killDate,
    });

    this.raidBoss = new RaidBossEntity(
      {
        raidBoss: props.raidBoss,
        server,
        respawn,
      },
      id,
    );
  }

  kill(killDate: Date, min: Date, max: Date) {
    this.apply(new RaidBossKilled(this.raidBoss.id, killDate, min, max));
  }

  onRaidBossKilled(event: RaidBossKilled) {
    const respawn = new Respawn({
      killDate: event.respawn.killDate,
      min: event.respawn.min,
      max: event.respawn.max,
    });

    const server = new Server({
      project: this.raidBoss.server.project,
      server: this.raidBoss.server.server,
    });
    this.raidBoss = new RaidBossEntity(
      {
        raidBoss: this.raidBoss.raidBoss,
        server,
        respawn,
      },
      this.raidBoss.id,
    );
  }
}
