import {
  HealthIndicatorResult,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { PrometheusService } from '@modules/prometheus/prometheus.service';
import { HealthIndicator } from '../interfaces/health-indicator.interface';
import { BaseHealthIndicator } from './base-health.indicator';
import { Connection } from 'mongoose';

export class MongoDBHealthIndicator
  extends BaseHealthIndicator
  implements HealthIndicator
{
  public readonly name = 'mongo';
  protected readonly help = 'Status of ' + this.name;

  constructor(
    private connection: Connection,
    private db: MongooseHealthIndicator,
    protected readonly promClientService: PrometheusService,
  ) {
    super();

    this.promClientService = promClientService;

    this.registerMetrics();
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {
    const result: Promise<HealthIndicatorResult> = this.db.pingCheck('l2b', {
      connection: this.connection,
    });
    this.updatePrometheusData(true);
    return result;
  }
}
