import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { routesV1 } from '@configs/app.routes';
import { HealthService } from '@modules/health/services/health.service';
import { PrometheusService } from '@modules/prometheus/prometheus.service';
import { MetricsService } from '../services/metrics.service';

@UseGuards(AuthGuard('basic'))
@Controller(routesV1.api.metrics)
export class MetricsController {
  constructor(
    private promClientService: PrometheusService,
    private healthService: HealthService,
    private metricsService: MetricsService,
  ) {}

  @Get()
  public async metrics(@Res() response: unknown) {
    await this.healthService.check();
    await this.metricsService.check();

    // @ts-expect-error no types for Req
    response.header('Content-Type', this.promClientService.contentType);
    // @ts-expect-error no types for Req
    response.send(await this.promClientService.metrics());
  }
}
