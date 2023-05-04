import { Logger } from '@nestjs/common';
import {
  CommandHandler,
  CommandBus,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { RaidBossDto } from '@modules/raid-bosses/infra/dto/raid-boss.dto';
import { AsteriosServer, Project } from '@shared/config';
import { KillRaidBoss } from '@modules/raid-bosses/app/commands/kill-raid-boss/kill-raid-boss.command';
import { GetRaidBosses } from '@modules/raid-bosses/app/queries/get-raid-bosses/get-raid-bosses.query';
import { gap } from '../../../task-time-config';
import { AsteriosEventsService } from '../../../services/asterios-events.service';
import { ParserService } from '../../../services/parser.service';
import { GetRbData } from './get-rb-data.command';

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

@CommandHandler(GetRbData)
export class GetRbDataService
  implements ICommandHandler<GetRbData, Result<any>>
{
  private readonly logger = new Logger(GetRbDataService.name);

  constructor(
    private readonly asteriosEvents: AsteriosEventsService,
    private readonly parser: ParserService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(): Promise<Result<null>> {
    this.logger.debug(`Get RB Data`);

    const entries = Object.entries(AsteriosServer);

    for await (const [server] of entries) {
      this.checkEventsForServer(AsteriosServer[server]);
      await sleep(gap);
    }

    return Result.ok();
  }

  private checkEventsForServer(server: AsteriosServer) {
    this.asteriosEvents.getEvents(server).subscribe(
      async (res) => {
        const events = this.parser.parse(res).reverse();
        const raidBossesResult: Result<RaidBossDto[]> =
          await this.queryBus.execute(
            new GetRaidBosses({ project: Project.Asterios, server }),
          );
        const raidBosses = raidBossesResult.getValue();

        for await (const event of events) {
          const exist = raidBosses.some(
            (rb) =>
              rb.project === Project.Asterios &&
              rb.server === server &&
              rb.raidBoss === event.raidBoss &&
              rb.killDate.getTime() >= event.date.getTime(),
          );

          if (!exist) {
            await this.commandBus.execute(
              new KillRaidBoss({
                killDate: event.date,
                project: Project.Asterios,
                server,
                raidBoss: event.raidBoss,
              }),
            );
          }
        }
      },
      (e) => {
        this.logger.warn(e);
      },
    );
  }
}
