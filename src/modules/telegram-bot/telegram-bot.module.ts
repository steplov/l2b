import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule, sessionMiddleware, botName } from './bot.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      botName,
      useFactory: (config: ConfigService) => ({
        token: config.get('telegram.key'),
        middlewares: [sessionMiddleware],
        include: [BotModule],
      }),
      inject: [ConfigService],
    }),
    BotModule,
  ],
})
export class TelegramBotModule {}
