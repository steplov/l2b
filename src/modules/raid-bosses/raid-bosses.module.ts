import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventSourcingModule } from '@shared/libs/eventsourcing';
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
import { RaidBossKilledUpdater } from './app/updaters/raid-boss-killed.updater';
import { RaidBossConfigUpdater } from './app/updaters/raid-boss-config.updater';
import { RespawnPredictor } from './services/respawn-predictor.service';

const commandHandlers = [KillRaidBossHandler, GenerateConfigHandler];
const stateUpdaters = [RaidBossKilledUpdater, RaidBossConfigUpdater];
const queryHandlers = [
  GetRaidBossHandler,
  GetRaidBossesHandler,
  GetRaidBossesConfigHandler,
  GetRaidBossByIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    EventSourcingModule.forFeature(),
    getRaidBossConfigRepositoryConnection(),
    getRaidBossReadRepositoryConnection(),
    AsteriosServerModule,
  ],
  providers: [
    RaidBossConfigRepository,
    RaidBossRepository,
    RespawnPredictor,
    ...commandHandlers,
    ...stateUpdaters,
    ...queryHandlers,
  ],
})
export class RaidBossesModule {}
