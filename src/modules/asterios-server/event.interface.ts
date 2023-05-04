import { RaidBoss } from '@shared/config';

export interface Event {
  date: Date;
  event: string;
  raidBoss: RaidBoss;
}
