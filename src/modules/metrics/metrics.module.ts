import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MetricsController } from './app/metrics.controller';
import { PrometheusModule } from '../prometheus/prometheus.module';
import { HealthModule } from '../health/health.module';
import { MetricsService } from './services/metrics.service';

@Module({
  controllers: [MetricsController],
  imports: [CqrsModule, PrometheusModule, HealthModule],
  providers: [MetricsService],
})
export class MetricsModule {}
