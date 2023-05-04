import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import {
  TelegramUserAggregate,
  TelegramUserAggregateProps,
} from '../../../domain/entities/telegram-user.aggregate';
import { UserRepository } from '../../../infra/repositories/user.repository';
import { UpdateUserSettings } from './update-user-settings.command';

@CommandHandler(UpdateUserSettings)
export class UpdateUserSettingsHandler
  implements ICommandHandler<UpdateUserSettings>
{
  private readonly logger = new Logger(UpdateUserSettingsHandler.name);

  constructor(
    private readonly repository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateUserSettings) {
    this.logger.debug(`UpdateUserSettings: ${JSON.stringify(command)}`);

    const { userId, languageCode } = command;

    try {
      const user = await this.repository.findUserById(userId);
      const telegramUserAggregate = new TelegramUserAggregate(
        this.eventBus,
        user,
        userId,
      );

      telegramUserAggregate.updateSettings(languageCode);
      await this.save(userId, telegramUserAggregate);
      telegramUserAggregate.commit();

      return Result.ok(command.userId);
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
