export class RaidBossWidgetDto {
  server: string;

  title: string;

  raidBoss: string;

  startsIn: string;

  respawnDuration: string;

  constructor(raidBoss: RaidBossWidgetDto) {
    this.server = raidBoss.server;
    this.raidBoss = raidBoss.raidBoss;
    this.title = raidBoss.title;
    this.startsIn = raidBoss.startsIn;
    this.respawnDuration = raidBoss.respawnDuration;
  }
}
