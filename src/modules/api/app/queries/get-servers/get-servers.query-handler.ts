import { Logger } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { AsteriosServer, TestServer, Project } from '@shared/config';
import {
  asteriosServerResponseMap,
  testServerResponseMap,
} from '../../../mappers/server-map';
import { GetServersQuery } from './get-servers.query';

@QueryHandler(GetServersQuery)
export class GetServersQueryHandler implements IQueryHandler<GetServersQuery> {
  private readonly logger = new Logger(GetServersQueryHandler.name);

  async execute(query: GetServersQuery): Promise<Result<string[]>> {
    this.logger.debug(`Get servers for project ${JSON.stringify(query)}`);

    if (query.project === Project.Test) {
      return Result.ok(
        Object.values(TestServer).map((s) => testServerResponseMap[s]),
      );
    }

    if (query.project === Project.Asterios) {
      return Result.ok(
        Object.values(AsteriosServer).map((s) => asteriosServerResponseMap[s]),
      );
    }

    return Result.ok([]);
  }
}
