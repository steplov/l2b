import * as dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { Controller, Get, Render, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { I18nService } from 'nestjs-i18n';
import { routesV1 } from '@configs/app.routes';
import { Result } from '@shared/domain/utils';
import { Project, AsteriosServer } from '@shared/config';
import { RaidBossDto } from '@modules/raid-bosses/infra/dto/raid-boss.dto';
import { asteriosServerRequestMap } from '@modules/api/mappers/server-map';
import { GetRaidBosses } from '@modules/raid-bosses/app/queries/get-raid-bosses/get-raid-bosses.query';
import { RaidBossesWidgetDto } from '../dtos/raid-bosses-widget.dto';
import { RaidBossWidgetDto } from '../dtos/raid-boss.dto';
import { IndexPageDto } from '../dtos/index-page.dto';
import { GetRaidBossesHttpRequest } from './get-raid-bosses.dto';

@Controller()
export class GetPageHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly i18n: I18nService,
    private readonly config: ConfigService,
  ) {}

  @Get(routesV1.web.index)
  @Render('index')
  async index(): Promise<any> {
    return new IndexPageDto(await this.i18n.t('messages.INDEX_TITLE'));
  }

  @Get(routesV1.web.asterios)
  @Render('widget')
  async widget(
    @Query() request: GetRaidBossesHttpRequest,
  ): Promise<RaidBossesWidgetDto | { error: string }> {
    const lang = request.lang || this.config.get('fallbackLanguage');
    const server =
      asteriosServerRequestMap[request.server] || AsteriosServer.Asterios;
    const query = new GetRaidBosses({
      project: Project.Asterios,
      server,
    } as any);
    const result: Result<RaidBossDto[]> = await this.queryBus.execute(query);

    if (result.isFailure) {
      return { error: result.error };
    }

    const raidBossesDtos = await Promise.all(
      result.getValue().map(
        async (rb) =>
          new RaidBossWidgetDto({
            ...rb,
            title: await this.i18n.t(`common.${rb.raidBoss}`, { lang }),
            startsIn:
              rb.startsIn &&
              (await this.i18n.t('messages.RESPAWN_STARTS_IN', {
                lang,
                args: rb,
              })),
            respawnDuration:
              rb.respawnDuration &&
              (await this.i18n.t('messages.RESPAWN_DURATION', {
                lang,
                args: rb,
              })),
          }),
      ),
    );

    return new RaidBossesWidgetDto(
      raidBossesDtos,
      request.server,
      await this.i18n.translate('messages.UPDATE_LABLE', { lang }),
      await this.i18n.translate('messages.WIDGET_TITLE', {
        lang,
        args: {
          title: server,
          date: dayjs().format('DD/MM/YYYY HH:mm:ss'),
        },
      }),
      await this.i18n.translate('messages.SERVER_LABLE', { lang }),
      await this.i18n.translate('messages.LANGUAGE_LABLE', { lang }),
      lang,
    );
  }
}
