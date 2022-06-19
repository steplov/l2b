import { Logger } from '@nestjs/common';
import { IViewUpdater, ViewUpdaterHandler } from '@shared/libs/eventsourcing';
import { UserRepository } from '../../infra/repositories/user.repository';
import { UserReadRepository } from '../../infra/repositories/user-read.repository';
import { UserSettingsUpdated } from '../../domain/events/user-settings-updated/user-settings-updated.event';
import { UserReadDto } from '../../infra/dto/user-read.dto';

@ViewUpdaterHandler(UserSettingsUpdated)
export class UserSettingsUpdatedUpdater
  implements IViewUpdater<UserSettingsUpdated>
{
  private logger = new Logger(UserSettingsUpdatedUpdater.name);

  constructor(
    private readonly repository: UserRepository,
    private readonly readRepository: UserReadRepository,
  ) {}

  async handle(event: UserSettingsUpdated) {
    this.logger.log('UserSettingsUpdated');
    const { id } = event;

    const userAggregate = await this.repository.findOneById(id);

    const { languageCode, subscriptions } =
      userAggregate.user.toObject() as UserReadDto;

    await this.readRepository.saveUser({
      _id: id,
      languageCode,
      subscriptions,
    });
  }
}
