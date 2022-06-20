import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { routesV1 } from '@configs/app.routes';
import { Notify } from '@modules/telegram-bot/app/commands/notify/notify.command';
import { GetUsers } from '@modules/telegram-bot/app/queries/get-users/get-users.query';
import { GenerateConfig } from '@modules/raid-bosses/app/commands/generate-config/generate-config.command';
import { UserReadDto } from '@modules/telegram-bot/infra/dto/user-read.dto';
import { KillRaidBoss } from '@modules/raid-bosses/app/commands/kill-raid-boss/kill-raid-boss.command';
import { GetRaidBossesConfig } from '@modules/raid-bosses/app/queries/get-raid-bosses-config/get-raid-bosses-config.query';

@UseGuards(AuthGuard('basic'))
@Controller()
export class GetAdminPageHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post(routesV1.web.notify)
  async notify(@Body() dto: any) {
    return this.commandBus.execute(
      new Notify({
        userId: dto.userId,
        message: dto.message,
      }),
    );
  }

  @Post(routesV1.web.config)
  async generateConfig() {
    return this.commandBus.execute(new GenerateConfig({}));
  }

  @Get(routesV1.web.config)
  async getRbConfig() {
    const result: Result<UserReadDto[]> = await this.queryBus.execute(
      new GetRaidBossesConfig({}),
    );

    if (result.isFailure) {
      return result.error;
    }

    return result.getValue();
  }

  @Get(routesV1.web.users)
  async users() {
    const result: Result<UserReadDto[]> = await this.queryBus.execute(
      new GetUsers({}),
    );

    if (result.isFailure) {
      return result.error;
    }

    return result.getValue();
  }

  @Post(`/admin/test-kill`)
  async testKill(@Body() dto: any) {
    const { project, server, raidBoss, killDate } = dto;

    return this.commandBus.execute(
      new KillRaidBoss({
        project,
        server,
        raidBoss,
        killDate: new Date(killDate),
      }),
    );
  }
}
