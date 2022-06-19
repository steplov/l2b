import { AggregateRoot } from '@nestjs/cqrs';
import {
  RaidBossEntry,
  RaidBossEntryProps,
} from '../value-objects/raid-boss-entry.value-object';
import { RaidBossConfigUpdated } from '../events/raid-boss-config-updated/raid-boss-config-updated.event';

export interface RaidBossConfigAggregateProps {
  raidBosses: RaidBossEntryProps[];
}

export class RaidBossConfigAggregate extends AggregateRoot {
  raidBosses: RaidBossEntry[];

  constructor(props: RaidBossConfigAggregateProps, public readonly id: string) {
    super();

    this.raidBosses = props.raidBosses.map((p) => new RaidBossEntry(p));
  }

  update(props: RaidBossConfigAggregateProps) {
    this.apply(new RaidBossConfigUpdated(props));
  }

  onRaidBossConfigUpdated(event: RaidBossConfigUpdated) {
    this.raidBosses = event.raidBosses.map((rb) => new RaidBossEntry(rb));
  }
}
