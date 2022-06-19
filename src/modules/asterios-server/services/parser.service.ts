import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { Injectable } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import { RaidBoss } from '@shared/config';
import { Event } from '../event.interface';

@Injectable()
export class ParserService {
  parse(page: string): Event[] {
    dayjs.extend(utc);
    dayjs.extend(timezone);

    const dom = new JSDOM(page);

    const rows = [...dom.window.document.getElementsByTagName('table')];

    if (!Array.isArray(rows)) return [];

    const events = rows.map((t) => {
      const content = t.rows[0].cells[0].children[0].innerHTML;
      const reg = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}): (.*)/;
      const [_, date, event] = reg.exec(content);

      const bosses = Object.entries(RaidBoss);

      const raidBoss = bosses.find(([_, value]) => event.includes(value));

      return {
        date: (dayjs.tz(date, 'Europe/Moscow') as any).$d,
        event,
        raidBoss: raidBoss ? RaidBoss[raidBoss[0]] : undefined,
      };
    });

    const knownEvents = events.filter((e) => !!e.raidBoss);

    return knownEvents;
  }
}
