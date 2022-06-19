import { Logger } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { UserReadRepository } from '../../../infra/repositories/user-read.repository';
import { UserReadDto } from '../../../infra/dto/user-read.dto';
import { GetUsers } from './get-users.query';

@QueryHandler(GetUsers)
export class GetUsersHandler implements IQueryHandler<GetUsers> {
  private readonly logger = new Logger(GetUsersHandler.name);

  constructor(private readonly readRepository: UserReadRepository) {}

  async execute(query: GetUsers): Promise<Result<UserReadDto[]>> {
    this.logger.debug(`GetUsers`);

    try {
      const usersData = await this.readRepository.findUsers();

      return Result.ok(usersData);
    } catch (e) {
      this.logger.error(e);
      return Result.fail(e.message);
    }
  }
}
