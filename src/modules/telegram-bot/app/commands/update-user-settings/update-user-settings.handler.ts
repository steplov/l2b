import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { StoreEventPublisher } from '@shared/libs/eventsourcing';
import { UserRepository } from '../../../infra/repositories/user.repository';
import { UpdateUserSettings } from './update-user-settings.command';

@CommandHandler(UpdateUserSettings)
export class UpdateUserSettingsHandler
  implements ICommandHandler<UpdateUserSettings>
{
  private readonly logger = new Logger(UpdateUserSettingsHandler.name);

  constructor(
    private readonly repository: UserRepository,
    private readonly publisher: StoreEventPublisher,
  ) {}

  async execute(command: UpdateUserSettings) {
    this.logger.debug(`UpdateUserSettings: ${JSON.stringify(command)}`);

    const { userId, languageCode } = command;

    try {
      const telegramUserAggregate = this.publisher.mergeObjectContext(
        await this.repository.findOneById(userId),
      );

      telegramUserAggregate.updateSettings(languageCode);
      telegramUserAggregate.commit();

      return Result.ok(command.userId);
    } catch (e) {
      this.logger.error(e);
      return Result.fail(e.message);
    }
  }
}
