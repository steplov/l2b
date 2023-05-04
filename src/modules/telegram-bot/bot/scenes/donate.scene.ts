import { UseFilters, UseInterceptors } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Markup } from 'telegraf';
import {
  Scene,
  SceneEnter,
  Action,
  SceneLeave,
  Ctx,
  On,
} from 'nestjs-telegraf';
import { I18nService } from 'nestjs-i18n';
import { Result } from '@shared/domain/utils';
import { DONATE_SCENE_ID } from '../constants';
import { ResponseTimeInterceptor } from '../common/interceptors/response-time.interceptor';
import { TelegrafExceptionFilter } from '../common/filters/telegraf-exception.filter';
import { Context } from '../interfaces/context.interface';
import { GetUser } from '../../app/queries/get-user/get-user.query';
import { UserReadDto } from '../../infra/dto/user-read.dto';

interface DonateSceneContext {
  languageCode: string;
  messageId: number;
}

const enum StaticActions {
  Close = 'close',
  Donate1 = 'donate_1',
  Donate2 = 'donate_2',
  Donate5 = 'donate_5',
}

@Scene(DONATE_SCENE_ID)
@UseInterceptors(ResponseTimeInterceptor)
@UseFilters(TelegrafExceptionFilter)
export class DonateScene {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly i18n: I18nService,
  ) {}

  @SceneEnter()
  async onSceneEnter(ctx: Context) {
    const userResult: Result<UserReadDto> = await this.queryBus.execute(
      new GetUser({ userId: `${ctx.from.id}` }),
    );

    if (userResult.isFailure) {
      throw new Error(userResult.error);
    }

    const { languageCode } = userResult.getValue();
    (ctx.scene.state as DonateSceneContext).languageCode = languageCode;

    const data = await ctx.replyWithHTML(
      'Donate',
      // await this.i18n.t('telegram.CHOOSE_SERVER_FOR_PROJECT', {
      //   lang: languageCode,
      //   args: { project },
      // }),
      await this.getInlineRootKeyboard(ctx),
    );

    (ctx.scene.state as DonateSceneContext).messageId = (
      data as any
    ).message_id;
  }

  @SceneLeave()
  async onSceneLeave(@Ctx() ctx: Context) {
    await ctx.deleteMessage((ctx.scene.state as DonateSceneContext).messageId);
  }

  @Action(StaticActions.Close)
  async close(ctx: Context) {
    await ctx.scene.leave();
  }

  @Action([StaticActions.Donate1, StaticActions.Donate2, StaticActions.Donate5])
  async donate(@Ctx() ctx) {
    const [action, amount] = ctx.match.input.split('_');

    console.log;
    return ctx.replyWithInvoice(this.getInvoice(ctx.from.id, parseInt(amount)));
  }

  private async getInlineCloseBtn(ctx: Context) {
    const lang = (ctx.scene.state as DonateSceneContext).languageCode;
    const label = await this.i18n.t('telegram.CLOSE', { lang });
    return Markup.button.callback(label, StaticActions.Close);
  }

  private async getInlineRootKeyboard(ctx: Context) {
    const keyboard = [
      [
        Markup.button.callback(
          '💲 Donate 1$ for a beer',
          StaticActions.Donate1,
        ),
      ],
      [
        Markup.button.callback(
          '💲 Donate 2$ for a beer',
          StaticActions.Donate2,
        ),
      ],
      [
        Markup.button.callback(
          '💲 Donate 5$ for a beer',
          StaticActions.Donate5,
        ),
      ],
      [await this.getInlineCloseBtn(ctx)],
    ];

    return Markup.inlineKeyboard(keyboard);
  }

  private async getInvoice(id: number, amount: number) {
    const invoice = {
      chat_id: id,
      provider_token: '632593626:TEST:sandbox_i3884705400',
      title: 'Donate for a beer',
      description: `Give $${amount}.00 for admin to buy himself a beer`,
      currency: 'USD',
      prices: [{ label: `$${amount}.00`, amount: amount * 100 }],
      payload: `donate from ${id}`,
    };

    return invoice;
  }
}
