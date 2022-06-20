import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import {
  TelegramUserAggregate,
  TelegramUserAggregateProps,
} from '../../../domain/entities/telegram-user.aggregate';
import { UserRepository } from '../../../infra/repositories/user.repository';
import { CreateUser } from './create-user.command';

@CommandHandler(CreateUser)
export class CreateUserHandler implements ICommandHandler<CreateUser> {
  private readonly logger = new Logger(CreateUserHandler.name);

  constructor(
    private readonly repository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateUser) {
    this.logger.debug(`CreateUser: ${JSON.stringify(command)}`);

    const { id, languageCode } = command;

    try {
      const user = await this.repository.findUserById(id);

      let telegramUserAggregate: TelegramUserAggregate;
      if (user) {
        telegramUserAggregate = new TelegramUserAggregate(
          this.eventBus,
          user,
          id,
        );
      } else {
        telegramUserAggregate = new TelegramUserAggregate(
          this.eventBus,
          {},
          id,
        );
      }

      telegramUserAggregate.create(languageCode);
      this.save(id, telegramUserAggregate);
      telegramUserAggregate.commit();

      return Result.ok(command.id);
    } catch (e) {
      this.logger.error(e);
      return Result.fail(e.message);
    }
  }

  async save(id: string, telegramUserAggregate: TelegramUserAggregate) {
    const { subscriptions, languageCode } =
      telegramUserAggregate.user.toObject() as TelegramUserAggregateProps;

    await this.repository.saveUser({
      _id: id,
      subscriptions,
      languageCode,
    });
  }
}
