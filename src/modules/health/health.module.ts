import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { PrometheusModule } from '@modules/prometheus/prometheus.module';
import { getRaidBossReadRepositoryConnection } from '@modules/raid-bosses/infra/repositories/raid-boss.repository';
import { HealthController } from './app/health.controller';
import { HealthService } from './services/health.service';

@Module({
  imports: [
    getRaidBossReadRepositoryConnection(),
    TerminusModule,
    PrometheusModule,
    ConfigModule,
  ],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
