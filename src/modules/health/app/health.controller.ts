import {
  Controller,
  Get,
  ServiceUnavailableException,
  Req,
} from '@nestjs/common';
import { HealthCheckResult } from '@nestjs/terminus';
import { routesV1 } from '@configs/app.routes';
import { HealthService } from '../services/health.service';
import { Request } from 'express';

@Controller(routesV1.api.health)
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  public async check(
    @Req() req: Request,
  ): Promise<HealthCheckResult | undefined> {
    this.healthService.setHost(`${req.protocol}://${req.get('Host')}`);

    const healthCheckResult: HealthCheckResult | undefined =
      await this.healthService.check();
    for (const key in healthCheckResult?.info) {
      if (healthCheckResult?.info[key].status === 'down') {
        throw new ServiceUnavailableException(healthCheckResult);
      }
    }
    return healthCheckResult;
  }
}
