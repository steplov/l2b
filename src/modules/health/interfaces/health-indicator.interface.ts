import { HealthIndicatorResult } from '@nestjs/terminus';

export interface HealthIndicator {
  name: string;
  callMetrics: any;
  updatePrometheusData(isConnected: boolean): void;
  isHealthy(): Promise<HealthIndicatorResult>;
  reportUnhealthy(): HealthIndicatorResult;
}
