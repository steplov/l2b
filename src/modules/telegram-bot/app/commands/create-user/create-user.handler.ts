import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { StoreEventPublisher } from '@shared/libs/eventsourcing';
import { UserRepository } from '../../../infra/repositories/user.repository';
import { CreateUser } from './create-user.command';

@CommandHandler(CreateUser)
export class CreateUserHandler implements ICommandHandler<CreateUser> {
  private readonly logger = new Logger(CreateUserHandler.name);

  constructor(
    private readonly repository: UserRepository,
    private readonly publisher: StoreEventPublisher,
  ) {}

  async execute(command: CreateUser) {
    this.logger.debug(`CreateUser: ${JSON.stringify(command)}`);

    const { id, languageCode } = command;

    try {
      const telegramUserAggregate = this.publisher.mergeObjectContext(
        await this.repository.findOneById(id),
      );

      telegramUserAggregate.create(languageCode);
      telegramUserAggregate.commit();

      return Result.ok(command.id);
    } catch (e) {
      this.logger.error(e);
      return Result.fail(e.message);
    }
  }
}
