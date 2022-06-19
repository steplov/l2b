import * as path from 'path';
import { UseFilters, UseInterceptors, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import {
  Help,
  InjectBot,
  Ctx,
  On,
  Start,
  Update,
  Command,
} from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { TelegrafGA4 } from '@shared/libs/tga4';
import { Result } from '@shared/domain/utils';
import { sleep } from '@shared/utils/sleep';
import { I18nService } from 'nestjs-i18n';
import {
  botName,
  RESPAWN_SCENE_ID,
  SUBSCRIPTION_SCENE_ID,
  SETTINGS_SCENE_ID,
  DONATE_SCENE_ID
} from './constants';
import { Context } from './interfaces/context.interface';
import { ResponseTimeInterceptor } from './common/interceptors/response-time.interceptor';
import { TelegrafExceptionFilter } from './common/filters/telegraf-exception.filter';
import { RaidBossDto } from '@modules/raid-bosses/infra/dto/raid-boss.dto';
import { CreateUser } from '../app/commands/create-user/create-user.command';
import { GetUser } from '../app/queries/get-user/get-user.query';
import { UserReadDto } from '../infra/dto/user-read.dto';
import { setCommands } from './common/set-commands';

interface BotContext {
  languageCode: string;
}

@Update()
@UseInterceptors(ResponseTimeInterceptor)
@UseFilters(TelegrafExceptionFilter)
export class BotUpdate {
  private readonly ga4: TelegrafGA4; 

  private readonly logger = new Logger(BotUpdate.name);

  constructor(
    @InjectBot(botName)
    private readonly bot: Telegraf<Context>,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly i18n: I18nService,
    private readonly config: ConfigService,
  ) {
    this.ga4 = new TelegrafGA4({
      measurement_id: this.config.get('ga.measurement_id'),
      api_secret: this.config.get('ga.api_secret'),
      client_id: this.config.get('ga.client_id')
    });

    this.bot.use(this.ga4.middleware())
  }

  @Start()
  async onStart(ctx: any): Promise<void> {
    const { id, language_code } = ctx.from;

    await this.commandBus.execute(
      new CreateUser({
        id: `${id}`,
        languageCode: language_code,
      }),
    );
    
    ctx.ga4.event('login', { method: 'tg' });

    await sleep(100);

    const userResult: Result<UserReadDto> = await this.queryBus.execute(
      new GetUser({ userId: `${ctx.from.id}` }),
    );

    if (userResult.isFailure) {
      throw new Error(userResult.error)
    }

    const { languageCode } = userResult.getValue();
    (ctx.scene.state as BotContext).languageCode = languageCode;

    await setCommands(this.bot.telegram, this.i18n, 'en');

    this.replyOnStart(ctx);
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    ctx.replyWithPhoto({ source: path.join(__dirname, '../../../../views/icon.png')})
  }

  @Command('/respawn')
  async respawnCommand(@Ctx() ctx: Context) {
    await ctx.scene.enter(RESPAWN_SCENE_ID);
  }

  @Command('/subscriptions')
  async subscriptionsCommand(@Ctx() ctx: Context) {
    await ctx.scene.enter(SUBSCRIPTION_SCENE_ID);
  }

  @Command('/settings')
  async settingsCommand(@Ctx() ctx: Context) {
    await ctx.scene.enter(SETTINGS_SCENE_ID);
  }

  // @Command('/donate')
  // async donateCommand(@Ctx() ctx: Context) {
  //   await ctx.scene.enter(DONATE_SCENE_ID);
  // }

  // Donate scene
  @On('pre_checkout_query')
  preCheckoutQuery(@Ctx() ctx: Context) {
    ctx.answerPreCheckoutQuery(true);
  }

  @On('text')
  onMessage(@Ctx() ctx) {
    this.replyOnStart(ctx);
  }

  private async replyOnStart(ctx: Context) {
    const lang = (ctx.scene.state as BotContext).languageCode;

    ctx.replyWithHTML(
      await this.i18n.t('telegram.BOT_WELCOME', { lang, args: { lang } }),
    );
  }

  async notifyBossKilled(raidBoss: RaidBossDto, userIds: number[]) {
    const ctx = this.bot.context;

    for await (const userId of userIds) {
      const lang = await this.getUserLanguage(userId);
  
      if (lang) {
        const message = await this.i18n.t('telegram.BOSS_WAS_KILLED', { lang, args: {
            server: raidBoss.server,
            raidBoss: raidBoss.raidBoss
          }
        });
  
        await this.bot.telegram.sendMessage(userId, message, {
          parse_mode: 'HTML',
        });
      }
    }
  }

  async notifyTimeBeforeMaxSpawn(
    raidBoss: RaidBossDto,
    userIds: number[],
    hours: number,
  ) {
    this.logger.debug('notifyTimeBeforeMaxSpawn');

    for await (const userId of userIds) {
      const lang = await this.getUserLanguage(userId);

      if (lang) {

        const message = await this.i18n.t('telegram.BOSS_WILL_SPAWN_IN', { lang, args: {
            server: raidBoss.server,
            raidBoss: raidBoss.raidBoss,
            count: hours
          }
        });

        await this.bot.telegram.sendMessage(userId, message, {
          parse_mode: 'HTML',
        });
      }
    }
  }

  async notifyUser(userId: string, message: string) {
    console.log('notify', userId, message);

    await this.bot.telegram.sendMessage(userId, message);
  }

  private async getUserLanguage(userId: number) {
    const userResult: Result<UserReadDto> = await this.queryBus.execute(
      new GetUser({ userId: `${userId}` }),
    );

    if (userResult.isFailure) {
      this.logger.error(userResult.error)
      return undefined;
    }

    const { languageCode } = userResult.getValue();

    return languageCode;
  }
}
