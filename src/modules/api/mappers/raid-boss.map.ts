import { objectFlip } from '@shared/utils/object-flip';
import { RaidBoss } from '@shared/config';

export const raidBossRequestMap = {
  kernon: RaidBoss.Kernon,
  cabrio: RaidBoss.Cabrio,
  golkonda: RaidBoss.Golkonda,
  hallate: RaidBoss.Hallate,
};

export const raidBossResponseMap = objectFlip(raidBossRequestMap);
