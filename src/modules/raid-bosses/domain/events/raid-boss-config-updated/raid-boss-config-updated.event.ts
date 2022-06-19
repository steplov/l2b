import { StorableEvent } from '@shared/libs/eventsourcing';
import {
  RaidBossEntry,
  RaidBossEntryProps,
} from '../../value-objects/raid-boss-entry.value-object';

export class RaidBossConfigUpdated extends StorableEvent {
  eventAggregate = 'raidBossConfig';
  eventVersion = 1;
  id = '1';

  raidBosses: RaidBossEntryProps[];

  constructor(props: { raidBosses: RaidBossEntryProps[] }) {
    super();

    this.raidBosses = props.raidBosses.map((rb) =>
      new RaidBossEntry(rb).unpack(),
    );
  }
}
