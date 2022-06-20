import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AsteriosServerModule } from '@modules/asterios-server/asterios-server.module';
import {
  RaidBossRepository,
  getRaidBossReadRepositoryConnection,
} from './infra/repositories/raid-boss.repository';
import {
  RaidBossConfigRepository,
  getRaidBossConfigRepositoryConnection,
} from './infra/repositories/raid-boss-config.repository';
import { KillRaidBossHandler } from './app/commands/kill-raid-boss/kill-raid-boss.handler';
import { GenerateConfigHandler } from './app/commands/generate-config/generate-config.handler';
import { GetRaidBossHandler } from './app/queries/get-raid-boss/get-raid-boss.handler';
import { GetRaidBossesHandler } from './app/queries/get-raid-bosses/get-raid-bosses.handler';
import { GetRaidBossesConfigHandler } from './app/queries/get-raid-bosses-config/get-raid-bosses-config.handler';
import { GetRaidBossByIdHandler } from './app/queries/get-raid-boss-by-id/get-raid-boss-by-id.handler';
import { RespawnPredictor } from './services/respawn-predictor.service';

const commandHandlers = [KillRaidBossHandler, GenerateConfigHandler];
const queryHandlers = [
  GetRaidBossHandler,
  GetRaidBossesHandler,
  GetRaidBossesConfigHandler,
  GetRaidBossByIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    getRaidBossConfigRepositoryConnection(),
    getRaidBossReadRepositoryConnection(),
    AsteriosServerModule,
  ],
  providers: [
    RaidBossConfigRepository,
    RaidBossRepository,
    RespawnPredictor,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class RaidBossesModule {}
