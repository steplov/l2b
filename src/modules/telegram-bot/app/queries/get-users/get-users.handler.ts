import { Logger } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { UserRepository } from '../../../infra/repositories/user.repository';
import { UserReadDto } from '../../../infra/dto/user-read.dto';
import { GetUsers } from './get-users.query';

@QueryHandler(GetUsers)
export class GetUsersHandler implements IQueryHandler<GetUsers> {
  private readonly logger = new Logger(GetUsersHandler.name);

  constructor(private readonly repository: UserRepository) {}

  async execute(): Promise<Result<UserReadDto[]>> {
    this.logger.debug(`GetUsers`);

    try {
      const usersData = await this.repository.findUsers();

      return Result.ok(usersData);
    } catch (e) {
      this.logger.error(e);
      return Result.fail(e.message);
    }
  }
}
