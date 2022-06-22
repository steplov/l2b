import { QueryBus } from '@nestjs/cqrs';
import { Result } from '@shared/domain/utils';
import { BaseIndicator } from '@modules/prometheus/models/base.indicator';
import { PrometheusService } from '@modules/prometheus/prometheus.service';
import { GetUsers } from '@modules/telegram-bot/app/queries/get-users/get-users.query';

export class UsersMetric extends BaseIndicator {
  public readonly name = 'users';
  protected readonly help = 'Count of ' + this.name;

  protected readonly labelNames = [];

  constructor(
    protected readonly promClientService: PrometheusService,
    private readonly queryBus: QueryBus,
  ) {
    super();
    this.promClientService = promClientService;
    this.registerGauges();
  }

  public async update(): Promise<void> {
    const result: Result<any[]> = await this.queryBus.execute(new GetUsers({}));

    if (result.isFailure) {
      return;
    }

    this.gauge.set(result.getValue().length);
  }
}
