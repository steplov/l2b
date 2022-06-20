import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { I18nModule, I18nJsonParser } from 'nestjs-i18n';
import { AuthModule } from '@modules/auth/auth.module';
import { TelegramBotModule } from '@modules/telegram-bot';
import { ApiModule } from '@modules/api/api.module';
import { WebModule } from '@modules/web/web.module';
import { AsteriosServerModule } from '@modules/asterios-server/asterios-server.module';
import { RaidBossesModule } from '@modules/raid-bosses/raid-bosses.module';
import { AppService } from './app.service';

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env' : '.env.development',
    }),
    I18nModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        fallbackLanguage: config.get('fallbackLanguage'),
        parserOptions: {
          path: join(__dirname, '/i18n/'),
          watch: process.env.NODE_ENV !== 'production',
        },
      }),
      parser: I18nJsonParser,
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      connectionName: 'l2b',
      useFactory: async (config: ConfigService) => ({
        uri: config.get('mongodb.url'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    AsteriosServerModule,
    RaidBossesModule,
    ApiModule,
    WebModule,
    TelegramBotModule,
  ],
  providers: [AppService],
})
export class AppModule {}
