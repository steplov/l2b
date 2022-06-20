import { Logger } from '@nestjs/common';
import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { RaidBossConfigDto } from '@shared/dto/raid-boss-config.dto';
import { GetRaidBossesConfig } from '@modules/raid-bosses/app/queries/get-raid-bosses-config/get-raid-bosses-config.query';
import { UserRepository } from '../../../infra/repositories/user.repository';
import { GetSubscriptions } from './get-subscriptions.query';

@QueryHandler(GetSubscriptions)
export class GetSubscriptionsHandler
  implements IQueryHandler<GetSubscriptions>
{
  private readonly logger = new Logger(GetSubscriptionsHandler.name);

  constructor(
    private readonly repository: UserRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    command: GetSubscriptions,
  ): Promise<Result<RaidBossConfigDto[]>> {
    this.logger.debug(`GetSubscriptions: ${JSON.stringify(command)}`);

    try {
      const raidBossesResponse: Result<RaidBossConfigDto[]> =
        await this.queryBus.execute(new GetRaidBossesConfig({}));
      const raidBosses = raidBossesResponse.getValue();
      const userData = await this.repository.findUserById(command.userId);
      const rb: RaidBossConfigDto[] = userData.subscriptions.map((id) =>
        raidBosses.find((rb) => rb.id === id),
      );

      return Result.ok(rb);
    } catch (e) {
      this.logger.error(e);
      return Result.fail(e.message);
    }
  }
}
