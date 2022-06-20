import { UseFilters, UseInterceptors } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Markup } from 'telegraf';
import { Scene, SceneEnter, Action, SceneLeave, Ctx } from 'nestjs-telegraf';
import { I18nService } from 'nestjs-i18n';
import {
  RaidBoss,
  Project,
  ServerTuple,
  servers,
  raidBossOrder,
} from '@shared/config';
import { chunk } from '@shared/utils/chunk';
import { Result } from '@shared/domain/utils';
import { GetRaidBosses } from '@modules/raid-bosses/app/queries/get-raid-bosses/get-raid-bosses.query';
import { RaidBossDto } from '@modules/raid-bosses/infra/dto/raid-boss.dto';
import { RESPAWN_SCENE_ID } from '../constants';
import { ResponseTimeInterceptor } from '../common/interceptors/response-time.interceptor';
import { TelegrafExceptionFilter } from '../common/filters/telegraf-exception.filter';
import { Context } from '../interfaces/context.interface';
import { GetUser } from '../../app/queries/get-user/get-user.query';
import { UserReadDto } from '../../infra/dto/user-read.dto';

interface RespawnSceneContext {
  project: Project;
  languageCode: string;
  messageId: number;
}

const enum StaticActions {
  Close = 'close',
}

@Scene(RESPAWN_SCENE_ID)
@UseInterceptors(ResponseTimeInterceptor)
@UseFilters(TelegrafExceptionFilter)
export class RespawnScene {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly i18n: I18nService,
  ) {}

  private static getServerButton(project: Project, server: ServerTuple) {
    return Markup.button.callback(server, `${project}-${server}`);
  }

  private static getServerButtons(project: Project, columns: number) {
    return chunk(
      Object.values(servers[project]).map((s) =>
        RespawnScene.getServerButton(project, s as unknown as ServerTuple),
      ),
      columns,
    );
  }

  @SceneEnter()
  async onSceneEnter(ctx: Context) {
    const project = Project.Asterios;
    ctx.ga4.event('page_view', { page_title: 'tg:respawn' });
    ctx.ga4.event('tg:respawn:enter');

    const userResult: Result<UserReadDto> = await this.queryBus.execute(
      new GetUser({ userId: `${ctx.from.id}` }),
    );

    if (userResult.isFailure) {
      throw new Error(userResult.error);
    }

    const { languageCode } = userResult.getValue();

    (ctx.scene.state as RespawnSceneContext).project = project;
    (ctx.scene.state as RespawnSceneContext).languageCode = languageCode;

    const data = await ctx.replyWithHTML(
      await this.i18n.t('telegram.CHOOSE_SERVER_FOR_PROJECT', {
        lang: languageCode,
        args: { project },
      }),
      await this.getInlineRootKeyboard(ctx, project),
    );

    (ctx.scene.state as RespawnSceneContext).messageId = (
      data as any
    ).message_id;
  }

  @SceneLeave()
  async onSceneLeave(@Ctx() ctx: Context) {
    await ctx.deleteMessage((ctx.scene.state as RespawnSceneContext).messageId);
  }

  @Action(StaticActions.Close)
  async close(ctx: Context) {
    ctx.ga4.event('tg_respawn_leave');
    await ctx.scene.leave();
  }

  @Action([new RegExp(`(${[Project.Test, Project.Asterios].join('|')})`)])
  async onServer(ctx): Promise<void> {
    const lang = (ctx.scene.state as RespawnSceneContext).languageCode;
    const [project, server] = (ctx.callbackQuery as any).data.split('-');

    ctx.ga4.event('page_view', {
      page_title: `tg:respawn:${project}:${server}`,
    });

    const query = new GetRaidBosses({ project, server });

    const result: Result<RaidBossDto[]> = await this.queryBus.execute(query);

    if (result.isSuccess) {
      const raidBosses = result.getValue();

      if (raidBosses.length > 0) {
        const rbStrings = [];

        for await (const raidBoss of this.sortRB(raidBosses)) {
          rbStrings.push(await this.formatBossMessage(ctx, raidBoss));
        }

        const data = await ctx.editMessageText(
          `<strong>${server}</strong>\n\n${rbStrings.join('\n\n')}`,
          {
            parse_mode: 'HTML',
            ...(await this.getInlineRootKeyboard(ctx, project)),
          },
        );
        (ctx.scene.state as RespawnSceneContext).messageId = (
          data as any
        ).message_id;
      } else {
        const data = await ctx.editMessageText(
          await this.i18n.t('telegram.NO_RESULTS_FOR_SERVER', {
            lang,
            args: { server },
          }),
          {
            parse_mode: 'HTML',
            ...(await this.getInlineRootKeyboard(ctx, project)),
          },
        );
        (ctx.scene.state as RespawnSceneContext).messageId = (
          data as any
        ).message_id;
      }
    } else {
      throw new Error('Unknown error');
    }
  }

  private async formatBossMessage(ctx: Context, raidBoss: RaidBossDto) {
    const lang = (ctx.scene.state as RespawnSceneContext).languageCode;
    const bossTitle = await this.i18n.t(`common.${raidBoss.raidBoss}`, {
      lang,
    });
    const key = raidBoss.startsIn
      ? 'telegram.BOT_RESPAWN_STARTS_IN'
      : 'telegram.BOT_RESPAWN_DURATION';

    return await this.i18n.t(key, {
      lang,
      args: {
        startsIn: raidBoss.startsIn,
        respawnDuration: raidBoss.respawnDuration,
        raidBoss: bossTitle,
      },
    });
  }

  private async getInlineCloseBtn(ctx: Context) {
    const lang = (ctx.scene.state as RespawnSceneContext).languageCode;
    const label = await this.i18n.t('telegram.CLOSE', { lang });
    return Markup.button.callback(label, StaticActions.Close);
  }

  private async getInlineRootKeyboard(ctx: Context, project: Project) {
    const keyboard = [
      ...RespawnScene.getServerButtons(project, 3),
      [await this.getInlineCloseBtn(ctx)],
    ];

    return Markup.inlineKeyboard(keyboard);
  }

  private sortRB(raidBosses: RaidBossDto[]): RaidBossDto[] {
    return raidBosses.sort((a, b) => {
      return (
        raidBossOrder.indexOf(a.raidBoss as unknown as RaidBoss) -
        raidBossOrder.indexOf(b.raidBoss as unknown as RaidBoss)
      );
    });
  }
}
