export interface RaidBossReadDto {
  _id: string;
  project: string;
  server: string;
  raidBoss: string;
  killDate: Date;
  min: Date;
  max: Date;
}
