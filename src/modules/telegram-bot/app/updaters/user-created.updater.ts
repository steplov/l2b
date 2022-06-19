import { Logger } from '@nestjs/common';
import { IViewUpdater, ViewUpdaterHandler } from '@shared/libs/eventsourcing';
import { UserRepository } from '../../infra/repositories/user.repository';
import { UserReadRepository } from '../../infra/repositories/user-read.repository';
import { UserCreated } from '../../domain/events/user-created/user-created.event';
import { UserReadDto } from '../../infra/dto/user-read.dto';

@ViewUpdaterHandler(UserCreated)
export class UserCreatedUpdater implements IViewUpdater<UserCreated> {
  private logger = new Logger(UserCreatedUpdater.name);

  constructor(
    private readonly repository: UserRepository,
    private readonly readRepository: UserReadRepository,
  ) {}

  async handle(event: UserCreated) {
    this.logger.log('UserCreatedUpdater');
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
