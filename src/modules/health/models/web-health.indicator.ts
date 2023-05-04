import { HealthIndicatorResult, HttpHealthIndicator } from '@nestjs/terminus';
import { PrometheusService } from '../../prometheus/prometheus.service';
import { HealthIndicator } from '../interfaces/health-indicator.interface';
import { BaseHealthIndicator } from './base-health.indicator';

export class WebHealthIndicator
  extends BaseHealthIndicator
  implements HealthIndicator
{
  public readonly name = 'web';
  protected readonly help = 'Status of ' + this.name;

  constructor(
    private readonly httpHealthIndicator: HttpHealthIndicator,
    private readonly url: string = '',
    protected readonly promClientService: PrometheusService,
  ) {
    super();
    this.httpHealthIndicator = httpHealthIndicator;
    this.promClientService = promClientService;
    this.url = url || '';
    this.registerMetrics();
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {
    const result: Promise<HealthIndicatorResult> =
      this.httpHealthIndicator.pingCheck(this.name, this.url);
    // if the api dependency isn't available, HealthCheckService
    // of Terminus throws an error that need to be catched in the HealthService
    this.updatePrometheusData(true);
    return result;
  }
}
