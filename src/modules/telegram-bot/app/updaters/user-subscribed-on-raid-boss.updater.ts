import { Logger } from '@nestjs/common';
import { IViewUpdater, ViewUpdaterHandler } from '@shared/libs/eventsourcing';
import { UserRepository } from '../../infra/repositories/user.repository';
import { UserReadRepository } from '../../infra/repositories/user-read.repository';
import { UserSubscribedOnRaidBoss } from '../../domain/events/user-subscribed-on-raid-boss/user-subscribed-on-raid-boss.event';
import { UserReadDto } from '../../infra/dto/user-read.dto';

@ViewUpdaterHandler(UserSubscribedOnRaidBoss)
export class UserSubscribedOnRaidBossUpdater
  implements IViewUpdater<UserSubscribedOnRaidBoss>
{
  private logger = new Logger(UserSubscribedOnRaidBossUpdater.name);

  constructor(
    private readonly repository: UserRepository,
    private readonly readRepository: UserReadRepository,
  ) {}

  async handle(event: UserSubscribedOnRaidBoss) {
    this.logger.log('UserSubscribedOnRaidBoss');
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
