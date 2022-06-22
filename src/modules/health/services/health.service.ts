import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HttpHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { PrometheusService } from '@modules/prometheus/prometheus.service';
import { routesV1 } from '../../../infrastructure/configs/app.routes';
import { HealthIndicator } from '../interfaces/health-indicator.interface';
import { WebHealthIndicator } from '../models/web-health.indicator';
import { MongoDBHealthIndicator } from '../models/mongo-health.indicator';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class HealthService {
  private readonly listOfThingsToMonitor: HealthIndicator[];

  private host: string;

  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly promClientService: PrometheusService,
    private readonly mongoose: MongooseHealthIndicator,
    @InjectConnection('l2b')
    private readonly mongodb1: Connection,
    private readonly config: ConfigService
  ) {
    this.host = this.config.get<string>('host');

    this.listOfThingsToMonitor = [
      new MongoDBHealthIndicator(
        this.mongodb1,
        this.mongoose,
        this.promClientService,
      ),
    ];
  }

  @HealthCheck()
  public async check(): Promise<HealthCheckResult | undefined> {
    console.log(`${this.host}${routesV1.web.asterios}?server=asterios`)
    this.listOfThingsToMonitor.push(
      new WebHealthIndicator(
        this.http,
        `${this.host}${routesV1.web.asterios}?server=asterios`,
        this.promClientService,
      ),
    );
    return await this.health.check(
      this.listOfThingsToMonitor.map(
        (apiIndicator: HealthIndicator) => async () => {
          try {
            return await apiIndicator.isHealthy();
          } catch (e) {
            Logger.warn(e);
            return apiIndicator.reportUnhealthy();
          }
        },
      ),
    );
  }
}
