import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetPageHttpController } from './controllers/get-page.http.controller';
import { GetAdminPageHttpController } from './controllers/get-admin-page.http.controller';

const httpControllers = [GetPageHttpController, GetAdminPageHttpController];

@Module({
  imports: [CqrsModule],
  controllers: [...httpControllers],
})
export class WebModule {}
