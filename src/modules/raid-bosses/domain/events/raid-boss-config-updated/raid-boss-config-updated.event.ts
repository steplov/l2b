import { Event } from '@shared/domain/base-classes/event';
import {
  RaidBossEntry,
  RaidBossEntryProps,
} from '../../value-objects/raid-boss-entry.value-object';

export class RaidBossConfigUpdated extends Event {
  raidBosses: RaidBossEntryProps[];

  constructor(props: { raidBosses: RaidBossEntryProps[] }) {
    super();

    this.raidBosses = props.raidBosses.map((rb) =>
      new RaidBossEntry(rb).unpack(),
    );
  }
}
