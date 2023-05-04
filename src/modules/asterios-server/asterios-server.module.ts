import { Module, Logger } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { TaskService } from './services/asterios-task.service';
import { GetRbDataService } from './app/commands/get-rb-data/get-rb-data.service';
import { ParserService } from './services/parser.service';
import { AsteriosEventsService } from './services/asterios-events.service';
import { AsteriosRespawnPredictorService } from './services/asterios-respawn-predictor-service';

const commandHandlers = [GetRbDataService];

@Module({
  imports: [CqrsModule, HttpModule, ScheduleModule.forRoot()],
  providers: [
    Logger,
    TaskService,
    AsteriosEventsService,
    ParserService,
    AsteriosRespawnPredictorService,
    ...commandHandlers,
  ],
  exports: [AsteriosRespawnPredictorService],
})
export class AsteriosServerModule {}
