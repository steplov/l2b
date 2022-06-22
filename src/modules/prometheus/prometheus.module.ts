import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrometheusService } from './prometheus.service';

@Module({
  providers: [PrometheusService, ConfigModule],
  exports: [PrometheusService],
})
export class PrometheusModule {}
