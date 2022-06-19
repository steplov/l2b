import { UseFilters, UseInterceptors } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { Markup } from 'telegraf';
import { Scene, SceneEnter, Ctx, Action, SceneLeave } from 'nestjs-telegraf';
import { I18nService } from 'nestjs-i18n';
import { Result } from '@shared/domain/utils';
import { SETTINGS_SCENE_ID } from '../constants';
import { ResponseTimeInterceptor } from '../common/interceptors/response-time.interceptor';
import { TelegrafExceptionFilter } from '../common/filters/telegraf-exception.filter';
import { Context } from '../interfaces/context.interface';
import { GetUser } from '../../app/queries/get-user/get-user.query';
import { UpdateUserSettings } from '../../app/commands/update-user-settings/update-user-settings.command';
import { UserReadDto } from '../../infra/dto/user-read.dto';

interface SettingsSceneContext {
  languageCode: string;
  messageId: number;
}

const enum StaticActions {
  Close = 'close',
  Root = 'root',
  EN = 'en',
  UA = 'ua',
  RU = 'ru'
}

@Scene(SETTINGS_SCENE_ID)
@UseInterceptors(ResponseTimeInterceptor)
@UseFilters(TelegrafExceptionFilter)
export class SettingsScene {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly i18n: I18nService,
    private readonly commandBus: CommandBus,
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: Context) {
    const userResult: Result<UserReadDto> = await this.queryBus.execute(
      new GetUser({ userId: `${ctx.from.id}` }),
    );

    if (userResult.isFailure) {
      throw new Error(userResult.error)
    }

    ctx.ga4.event('page_view', { page_title: `tg:settings` });

    const { languageCode: lang } = userResult.getValue();

    (ctx.scene.state as SettingsSceneContext).languageCode = lang;

    const data = await ctx.replyWithHTML(
      await this.i18n.t('telegram.SETTINGS', { lang, args: { lang } }),
      {
        parse_mode: 'HTML',
        ...(await this.getInlineRootKeyboard(ctx)),
      },
    );
    (ctx.scene.state as SettingsSceneContext).messageId = (
      data as any
    ).message_id;
  }

  @Action([StaticActions.EN, StaticActions.UA, StaticActions.RU])
  async onRoot(@Ctx() ctx: Context) {
    const newLanguage = (ctx.callbackQuery as any).data;

    (ctx.scene.state as SettingsSceneContext).languageCode = newLanguage;

    ctx.ga4.event('tg_change_language', {
      lang: newLanguage
    });

    await this.commandBus.execute(
      new UpdateUserSettings({
        userId: `${ctx.from.id}`,
        languageCode: newLanguage,
      }),
    );
    await ctx.answerCbQuery();

    const data = await ctx.editMessageText(
      await this.i18n.t('telegram.SETTINGS', {
        lang: newLanguage,
        args: { lang: newLanguage },
      }),
      {
        parse_mode: 'HTML',
        ...(await this.getInlineRootKeyboard(ctx)),
      },
    );

    (ctx.scene.state as SettingsSceneContext).messageId = (
      data as any
    ).message_id;
  }

  @SceneLeave()
  async onSceneLeave(@Ctx() ctx: Context) {
    await ctx.deleteMessage(
      (ctx.scene.state as SettingsSceneContext).messageId,
    );
  }

  @Action(StaticActions.Close)
  async close(@Ctx() ctx: Context) {
    ctx.ga4.event('tg_settings_leave');
    await ctx.scene.leave();
  }

  private async getInlineRootKeyboard(ctx: Context) {
    const langs = [
      Markup.button.callback('Українська', StaticActions.UA),
      Markup.button.callback('English', StaticActions.EN),
      Markup.button.callback('Русский', StaticActions.RU)
    ];
    const buttons = [];

    switch((ctx.scene.state as SettingsSceneContext).languageCode) {
      case StaticActions.EN:
        buttons.push(
          langs[0],
          langs[2]
        )
        break;
      case StaticActions.UA:
        buttons.push(
          langs[1],
          langs[2]
        )
        break;
      case StaticActions.RU:
        buttons.push(
          langs[0],
          langs[1]
        )
        break
    }

    const keyboard = [
      buttons,
      [await this.getInlineCloseBtn(ctx)]
    ]

    return Markup.inlineKeyboard(keyboard);
  }

  private async getInlineCloseBtn(ctx) {
    return Markup.button.callback(
      await this.i18n.t('telegram.CLOSE', {
        lang: (ctx.scene.state as SettingsSceneContext).languageCode,
      }),
      StaticActions.Close,
    );
  }
}
