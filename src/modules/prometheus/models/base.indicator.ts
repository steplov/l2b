import { PrometheusHistogram, PrometheusService } from '../prometheus.service';
import { Logger } from '@nestjs/common';
import { Gauge } from 'prom-client';

export abstract class BaseIndicator {
  public abstract name: string;
  public callMetrics: any;

  protected abstract help: string;
  protected abstract readonly promClientService: PrometheusService | undefined;
  protected readonly labelNames = [];
  protected readonly buckets = [1];
  protected stateIsConnected = false;

  private metricsRegistered = false;
  private gaugesRegistered = false;
  protected gauge: Gauge<string> | undefined;

  private logger: Logger;

  public updatePrometheusData(isConnected: boolean): void {
    if (this.stateIsConnected !== isConnected) {
      if (isConnected) {
        this.logger.log(this.name + ' is available');
      }

      this.stateIsConnected = isConnected;

      if (this.metricsRegistered) {
        this.callMetrics({ status: this.stateIsConnected ? 1 : 0 });
      }

      if (this.gaugesRegistered) {
        this.gauge?.set(this.stateIsConnected ? 1 : 0);
      }
    }
  }

  protected registerMetrics(): void {
    this.logger = new Logger(this.name);

    if (this.promClientService) {
      this.logger.log('Register metrics histogram for: ' + this.name);
      this.metricsRegistered = true;
      const histogram: PrometheusHistogram =
        this.promClientService.registerMetrics(
          this.name,
          this.help,
          this.labelNames,
          this.buckets,
        );
      this.callMetrics = histogram.startTimer();
    }
  }

  protected registerGauges(): void {
    this.logger = new Logger(this.name);

    if (this.promClientService) {
      this.logger.log('Register metrics gauge for: ' + this.name);
      this.gaugesRegistered = true;
      this.gauge = this.promClientService.registerGauge(this.name, this.help);
    }
  }
}
