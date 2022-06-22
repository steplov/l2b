import { UseFilters, UseInterceptors } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { Markup } from 'telegraf';
import { Scene, SceneEnter, Ctx, Action, SceneLeave } from 'nestjs-telegraf';
import { I18nService } from 'nestjs-i18n';
import {
  RaidBoss,
  raidBossOrder,
  AsteriosServer,
  Project,
  TestServer,
  ServerTuple,
  servers,
} from '@shared/config';
import { Result } from '@shared/domain/utils';
import { sleep } from '@shared/utils/sleep';
import { chunk } from '@shared/utils/chunk';
import { RaidBossConfigDto } from '@shared/dto/raid-boss-config.dto';
import { GetSubscriptions } from '../../app/queries/get-subscriptions/get-subscriptions.query';
import { SUBSCRIPTION_SCENE_ID } from '../constants';
import { ResponseTimeInterceptor } from '../common/interceptors/response-time.interceptor';
import { TelegrafExceptionFilter } from '../common/filters/telegraf-exception.filter';
import { Context } from '../interfaces/context.interface';
import { GetRaidBossesConfig } from '@modules/raid-bosses/app/queries/get-raid-bosses-config/get-raid-bosses-config.query';
import { SubscribeToRaidBoss } from '../../app/commands/subscribe-to-raid-boss/subscribe-to-raid-boss.command';
import { UnsubscribeFromRaidBoss } from '../../app/commands/unsubscribe-from-raid-boss/unsubscribe-from-raid-boss.command';
import { GetUser } from '../../app/queries/get-user/get-user.query';
import { UserReadDto } from '../../infra/dto/user-read.dto';

interface RaidBossSubscription extends RaidBossConfigDto {
  subscribed: boolean;
}

interface SubscribeSceneContext {
  languageCode: string;
  messageId: number;
}

const enum StaticActions {
  Close = 'close',
  Root = 'root',
  ShowSubscriptions = 'show',
  ModifySubscriptions = 'modify',
  Subscribe = 'subscribe',
  Unsubscribe = 'unsubscribe',
}

@Scene(SUBSCRIPTION_SCENE_ID)
@UseInterceptors(ResponseTimeInterceptor)
@UseFilters(TelegrafExceptionFilter)
export class SubscriptionsScene {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly i18n: I18nService,
    private readonly commandBus: CommandBus,
  ) {}

  private static getServerButton(project: Project, server: ServerTuple) {
    return Markup.button.callback(server, `${project}-${server}`);
  }

  private static getServerButtons(project: Project, columns: number) {
    return chunk(
      Object.values(servers[project]).map((s) =>
        SubscriptionsScene.getServerButton(
          project,
          s as unknown as ServerTuple,
        ),
      ),
      columns,
    );
  }

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: Context) {
    const userResult: Result<UserReadDto> = await this.queryBus.execute(
      new GetUser({ userId: `${ctx.from.id}` }),
    );

    if (userResult.isFailure) {
      throw new Error(userResult.error);
    }

    const user = userResult.getValue();

    if (!user) {
      throw new Error('Something went wrong. Please restart the bot');
    }

    ctx.ga4.event('page_view', { page_title: 'tg:subscriptions' });
    ctx.ga4.event('tg:subscriptions:enter');

    const { languageCode } = user;

    (ctx.scene.state as SubscribeSceneContext).languageCode = languageCode;

    const data = await ctx.replyWithHTML(
      await this.i18n.t('telegram.SUBSCRIPTIONS', { lang: languageCode }),
      await this.getInlineRootKeyboard(ctx),
    );

    (ctx.scene.state as SubscribeSceneContext).messageId = (
      data as any
    ).message_id;
  }

  @SceneLeave()
  async onSceneLeave(@Ctx() ctx: Context) {
    await ctx.deleteMessage(
      (ctx.scene.state as SubscribeSceneContext).messageId,
    );
  }

  @Action(StaticActions.Root)
  async onRoot(@Ctx() ctx: Context) {
    const lang = (ctx.scene.state as SubscribeSceneContext).languageCode;

    const data = await ctx.editMessageText(
      await this.i18n.t('telegram.SUBSCRIPTIONS', { lang }),
      {
        parse_mode: 'HTML',
        ...(await this.getInlineRootKeyboard(ctx)),
      },
    );

    (ctx.scene.state as SubscribeSceneContext).messageId = (
      data as any
    ).message_id;
  }

  @Action(StaticActions.ShowSubscriptions)
  async showSubscriptions(@Ctx() ctx: Context) {
    ctx.ga4.event('page_view', { page_title: 'tg:subscriptions:show' });
    const lang = (ctx.scene.state as SubscribeSceneContext).languageCode;
    const subscriptionsQuery = new GetSubscriptions({
      userId: `${ctx.from.id}`,
    });
    const subscriptionsResult: Result<RaidBossConfigDto[]> =
      await this.queryBus.execute(subscriptionsQuery);
    let message = '';

    if (subscriptionsResult.isFailure) {
      throw new Error(subscriptionsResult.error);
    }

    const subscriptions = subscriptionsResult.getValue();

    if (subscriptions.length === 0) {
      message = await this.i18n.t('telegram.NO_SUBSCRIPTIONS', { lang });
    } else {
      const subsObj = subscriptions.reduce((acc, sub) => {
        acc[sub.server] = acc[sub.server] || [];
        acc[sub.server].push(sub);
        return acc;
      }, {});

      Object.keys(subsObj).forEach((server) => {
        message += `\n<strong>${server}</strong>`;

        this.sortRB(subsObj[server]).forEach((rb) => {
          message += `\n    ${rb.raidBoss}`;
        });
      });
      message.replace('\n', '');
    }

    await ctx.answerCbQuery();
    const data = await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        await this.getInlineBackButton(ctx, StaticActions.Root),
        await this.getInlineCloseBtn(ctx),
      ]),
    });

    (ctx.scene.state as SubscribeSceneContext).messageId = (
      data as any
    ).message_id;
  }

  @Action(StaticActions.Close)
  async close(@Ctx() ctx: Context) {
    ctx.ga4.event('tg_subscriptions_leave');
    await ctx.scene.leave();
  }

  @Action([Project.Test, Project.Asterios])
  async showProjects(@Ctx() ctx: Context) {
    ctx.ga4.event('page_view', { page_title: 'tg:subscriptions:edit' });
    await ctx.answerCbQuery();

    const data = await ctx.editMessageText(
      `Select server for <strong>${(ctx.callbackQuery as any).data}</strong>`,
      {
        parse_mode: 'HTML',
        ...(await this.getInlineKeyboardForServer(
          ctx,
          (ctx.callbackQuery as any).data,
        )),
      },
    );

    (ctx.scene.state as SubscribeSceneContext).messageId = (
      data as any
    ).message_id;
  }

  @Action([
    new RegExp(
      `(${[Project.Test, Project.Asterios].join('|')})-(${[
        ...Object.values(TestServer),
        ...Object.values(AsteriosServer),
      ].join('|')})`,
    ),
  ])
  async showSubscriptionsServer(@Ctx() ctx: Context) {
    const [project, server, raidBoss, action] = (
      ctx.callbackQuery as any
    ).data.split('-');

    const subscriptionsQuery = new GetSubscriptions({
      userId: `${ctx.from.id}`,
    });
    const raidBossesQuery = new GetRaidBossesConfig({});
    const raidBossesResult: Result<RaidBossConfigDto[]> =
      await this.queryBus.execute(raidBossesQuery);
    const initialMessage = `Subscriptions for <strong>${server}</strong>`;
    let message = initialMessage;

    if (raidBoss && action) {
      const props = {
        userId: `${ctx.from.id}`,
        project,
        server,
        raidBoss,
      };
      if (action === StaticActions.Subscribe) {
        ctx.ga4.event('tg_subscribe', {
          project,
          server,
          raidBoss,
        });
        await this.commandBus.execute(new SubscribeToRaidBoss(props));
        message += `\n(🟢 ${raidBoss})`;
      } else {
        ctx.ga4.event('tg_unsubscribe', {
          project,
          server,
          raidBoss,
        });
        await this.commandBus.execute(new UnsubscribeFromRaidBoss(props));
        message += `\n(❌ ${raidBoss})`;
      }

      await sleep(100);
    } else {
      ctx.ga4.event('page_view', {
        page_title: `tg:subscriptions:edit:${project}:${server}`,
      });
    }

    const subscriptionsResult: Result<RaidBossConfigDto[]> =
      await this.queryBus.execute(subscriptionsQuery);

    if (raidBossesResult.isFailure) {
      throw new Error(raidBossesResult.error);
    }

    if (subscriptionsResult.isFailure) {
      throw new Error(subscriptionsResult.error);
    }

    const raidBosses = raidBossesResult.getValue();
    const subscriptions = subscriptionsResult.getValue();
    const raidBossesForServer = raidBosses.filter(
      (rb) => rb.project === project && rb.server === server,
    );

    const result: RaidBossSubscription[] = raidBossesForServer.map((rb) => ({
      ...rb,
      subscribed: !!subscriptions.find((s) => s.id === rb.id),
    }));

    await ctx.answerCbQuery();

    const data = await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      ...(await this.getInlineKeyboardForServers(ctx, result, project)),
    });

    (ctx.scene.state as SubscribeSceneContext).messageId = (
      data as any
    ).message_id;
  }

  private async getInlineRootKeyboard(ctx: Context) {
    const lang = (ctx.scene.state as SubscribeSceneContext).languageCode;
    const keyboard = [
      [
        Markup.button.callback(
          await this.i18n.t('telegram.SHOW_SUBSCRIPTIONS', { lang }),
          StaticActions.ShowSubscriptions,
        ),
        Markup.button.callback(
          await this.i18n.t('telegram.MODIFY_SUBSCRIPTIONS', { lang }),
          Project.Asterios,
        ),
      ],
      [await this.getInlineCloseBtn(ctx)],
    ];

    return Markup.inlineKeyboard(keyboard);
  }

  private async getInlineKeyboardForServer(ctx, project: Project) {
    const keyboard = [
      ...SubscriptionsScene.getServerButtons(project, 3),
      [
        await this.getInlineBackButton(ctx, StaticActions.Root),
        await this.getInlineCloseBtn(ctx),
      ],
    ];

    return Markup.inlineKeyboard(keyboard);
  }

  private async getInlineKeyboardForServers(
    ctx: Context,
    raidBosses: RaidBossSubscription[],
    project: Project,
  ) {
    const keyboard = [];

    this.sortRB(raidBosses).forEach((rb) => {
      const label = `${rb.raidBoss} ${rb.subscribed ? '🟢' : '❌'}`;
      const callback = `${rb.project}-${rb.server}-${rb.raidBoss}-${
        rb.subscribed ? StaticActions.Unsubscribe : StaticActions.Subscribe
      }`;

      keyboard.push([Markup.button.callback(label, callback)]);
    });

    keyboard.push([
      await this.getInlineBackButton(ctx, project),
      await this.getInlineCloseBtn(ctx),
    ]);

    return Markup.inlineKeyboard(keyboard);
  }

  private async getInlineBackButton(ctx, action: string) {
    return Markup.button.callback(
      await this.i18n.t('telegram.BACK', {
        lang: (ctx.scene.state as SubscribeSceneContext).languageCode,
      }),
      action,
    );
  }

  private async getInlineCloseBtn(ctx) {
    return Markup.button.callback(
      await this.i18n.t('telegram.CLOSE', {
        lang: (ctx.scene.state as SubscribeSceneContext).languageCode,
      }),
      StaticActions.Close,
    );
  }

  private sortRB<T extends { raidBoss: RaidBoss }>(raidBosses: T[]): T[] {
    return raidBosses.sort((a, b) => {
      return (
        raidBossOrder.indexOf(a.raidBoss) - raidBossOrder.indexOf(b.raidBoss)
      );
    });
  }
}
