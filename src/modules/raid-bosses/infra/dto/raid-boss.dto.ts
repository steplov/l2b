export interface RaidBossDto {
  id: string;
  project: string;
  server: string;
  raidBoss: string;
  killDate: Date;
  min: Date;
  max: Date;
  startsIn: string | undefined;
  respawnLeft: string | undefined;
  respawnDuration: string | undefined;
}
