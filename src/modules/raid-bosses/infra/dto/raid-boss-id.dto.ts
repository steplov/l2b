import { Project, RaidBoss, ServerTuple } from '@shared/config';

export interface RaidBossIdDto {
  _id: string;
  project: Project;
  server: ServerTuple;
  raidBoss: RaidBoss;
}
