import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { PrometheusService } from '@modules/prometheus/prometheus.service';
import { UsersMetric } from './metrics/users.metric';

@Injectable()
export class MetricsService {
  private readonly listOfThingsToMonitor: any[];

  constructor(
    private readonly promClientService: PrometheusService,
    private readonly queryBus: QueryBus,
  ) {
    this.listOfThingsToMonitor = [
      new UsersMetric(this.promClientService, this.queryBus),
    ];
  }

  public async check() {
    for (const thingToMonitor of this.listOfThingsToMonitor) {
      await thingToMonitor.update();
    }
  }
}
