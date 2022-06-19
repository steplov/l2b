import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, catchError } from 'rxjs/operators';
import { AsteriosServer } from '@shared/config';
import { serverId } from '../enum';

@Injectable()
export class AsteriosEventsService {
  constructor(private httpService: HttpService) {}

  private static getUrl(id: string) {
    return `https://asterios.tm/index.php?cmd=rss&serv=${id}&wnd=none&filter=all`;
  }

  getEvents(server: AsteriosServer) {
    if (!serverId[server]) throw new Error('Unknown server');

    const id = serverId[server];

    return this.httpService
      .get(AsteriosEventsService.getUrl(id))
      .pipe(map((response) => response.data))
      .pipe(
        catchError((e) => {
          throw new Error(e.message);
        }),
      );
  }
}
