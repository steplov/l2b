import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetApiHttpController } from './app/queries/get-api/get-api.http.controller';
import { GetServersQueryHandler } from './app/queries/get-servers/get-servers.query-handler';
import { GetProjectsQueryHandler } from './app/queries/get-projects/get-projects.query-handler';

const httpControllers = [GetApiHttpController];
const queryHandlers = [GetServersQueryHandler, GetProjectsQueryHandler];

@Module({
  imports: [CqrsModule],
  controllers: [...httpControllers],
  providers: [...queryHandlers],
})
export class ApiModule {}
