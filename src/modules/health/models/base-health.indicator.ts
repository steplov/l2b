import { HealthIndicatorResult } from '@nestjs/terminus';
import { BaseIndicator } from '@modules/prometheus/models/base.indicator';

export abstract class BaseHealthIndicator extends BaseIndicator {
  public callMetrics: any;

  protected abstract help: string;

  protected readonly labelNames = ['status'];

  protected getStatus(
    key: string,
    isHealthy: boolean,
    data?: { [key: string]: any },
  ): HealthIndicatorResult {
    return {
      [key]: Object.assign({ status: isHealthy ? 'up' : 'down' }, data),
    } as HealthIndicatorResult;
  }

  public abstract isHealthy(): Promise<HealthIndicatorResult>;

  public reportUnhealthy(): HealthIndicatorResult {
    this.updatePrometheusData(false);
    return this.getStatus(this.name, false);
  }
}
