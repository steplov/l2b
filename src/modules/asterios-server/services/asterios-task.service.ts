import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Interval } from '@nestjs/schedule';
import { GetRbData } from '../app/commands/get-rb-data/get-rb-data.command';
import { interval } from '../task-time-config';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Interval(interval)
  handleInterval() {
    this.logger.debug('Asterios events intervar parser');
    this.commandBus.execute(new GetRbData({}));
  }
}
