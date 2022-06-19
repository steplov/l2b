import { Project, ServerTuple, RaidBoss } from '../config';

export interface RaidBossConfigDto {
  id: string;
  project: Project;
  server: ServerTuple;
  raidBoss: RaidBoss;
}
