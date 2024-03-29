import { Logger } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { UserRepository } from '../../../infra/repositories/user.repository';
import { UserReadDto } from '../../../infra/dto/user-read.dto';
import { GetUser } from './get-user.query';

@QueryHandler(GetUser)
export class GetUserHandler implements IQueryHandler<GetUser> {
  private readonly logger = new Logger(GetUserHandler.name);

  constructor(private readonly repository: UserRepository) {}

  async execute(command: GetUser): Promise<Result<UserReadDto>> {
    this.logger.debug(`GetUser: ${JSON.stringify(command)}`);

    try {
      const userData = await this.repository.findUserById(command.userId);

      return Result.ok(userData);
    } catch (e) {
      this.logger.error(e);
      return Result.fail(e.message);
    }
  }
}
