import { join } from 'path';
import * as hbs from 'hbs';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { compare } from '@shared/utils/handlebars-compare';
import { AppModule } from './app.module';
import { getLogLevels } from './shared/utils/get-log-levels';

const setupTemplateEngine = (app) => {
  hbs.registerHelper('compare', compare);
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
};

const setupSwagger = (app) => {
  const config = new DocumentBuilder()
    .setTitle('Lineage 2 Raid boss tracker')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: getLogLevels(process.env.NODE_ENV === 'production'),
  });

  setupSwagger(app);
  setupTemplateEngine(app);

  await app.listen(3000);
}
bootstrap();
