import { Logger } from '@nestjs/common';
import { IViewUpdater, ViewUpdaterHandler } from '@shared/libs/eventsourcing';
import { UserRepository } from '../../infra/repositories/user.repository';
import { UserReadRepository } from '../../infra/repositories/user-read.repository';
import { UserUnsubscribedFromRaidBoss } from '../../domain/events/unsubscribe-from-raid-boss/unsubscribe-from-raid-boss.command';
import { UserReadDto } from '../../infra/dto/user-read.dto';

@ViewUpdaterHandler(UserUnsubscribedFromRaidBoss)
export class UserUnsubscribedFromRaidBossUpdater
  implements IViewUpdater<UserUnsubscribedFromRaidBoss>
{
  private logger = new Logger(UserUnsubscribedFromRaidBossUpdater.name);

  constructor(
    private readonly repository: UserRepository,
    private readonly readRepository: UserReadRepository,
  ) {}

  async handle(event: UserUnsubscribedFromRaidBoss) {
    this.logger.log('UserUnsubscribedFromRaidBoss');
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
