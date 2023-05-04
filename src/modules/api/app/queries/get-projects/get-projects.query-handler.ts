import { Logger } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { Project } from '@shared/config';
import { projectResponseMap } from '../../../mappers/project-map';
import { GetProjectsQuery } from './get-projects.query';

@QueryHandler(GetProjectsQuery)
export class GetProjectsQueryHandler
  implements IQueryHandler<GetProjectsQuery>
{
  private readonly logger = new Logger(GetProjectsQuery.name);

  async execute(): Promise<Result<string[]>> {
    this.logger.debug(`Get supported projects`);

    return Result.ok(Object.values(Project).map((v) => projectResponseMap[v]));
  }
}
