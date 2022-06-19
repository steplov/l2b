import { AsteriosServer, RaidBoss, raidBossOrder } from '@shared/config';
import {
  serverResponseMap,
  serverRequestMap,
} from '@modules/api/mappers/server-map';
import { RaidBossWidgetDto } from './raid-boss.dto';

export class RaidBossesWidgetDto {
  servers: { title: string; value: string }[];
  languages: { title: string; value: string }[];
  server: { title: string; value: string };
  raidBosses: RaidBossWidgetDto[];

  constructor(
    raidBosses: RaidBossWidgetDto[],
    server: string,
    readonly updateLable: string,
    readonly title: string,
    readonly serverLable: string,
    readonly languageLable: string,
    readonly language: string,
  ) {
    this.raidBosses = this.sortRB(raidBosses);
    this.servers = Object.entries(AsteriosServer).map(([_, value]) => ({
      title: value,
      value: serverResponseMap[value],
    }));
    this.languages = ['en', 'ua', 'ru'].map((lang) => ({ title: lang, value: lang }));

    this.server = {
      title: serverRequestMap[server],
      value: server,
    };
  }

  sortRB(raidBosses: RaidBossWidgetDto[]): RaidBossWidgetDto[] {
    return raidBosses.sort((a, b) => {
      return (
        raidBossOrder.indexOf(a.raidBoss as unknown as RaidBoss) -
        raidBossOrder.indexOf(b.raidBoss as unknown as RaidBoss)
      );
    });
  }
}
