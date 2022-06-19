import { Injectable } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventStore } from '@shared/libs/eventsourcing';
import { Project, ServerTuple, RaidBoss } from '@shared/config';
import { RaidBossConfigDto } from '@shared/dto/raid-boss-config.dto';
import { RaidBossConfigAggregate } from '../../domain/entities/raid-boss-config.aggregate';
import {
  RaidBossConfig,
  RaidBossConfigDocument,
  RaidBossConfigSchema,
} from '../schemas/raid-boss-config.schema';

@Injectable()
export class RaidBossConfigRepository {
  constructor(
    private readonly eventStore: EventStore,
    @InjectModel(RaidBossConfig.name)
    private readonly raidBossConfigModel: Model<RaidBossConfigDocument>,
  ) {}

  async findAggregate(): Promise<RaidBossConfigAggregate> {
    const id = '1';
    const raidBossAggregate = new RaidBossConfigAggregate(
      {
        raidBosses: [],
      },
      id,
    );

    const events = await this.eventStore.getEvents('raidBossConfig', id);

    raidBossAggregate.loadFromHistory(events.events);

    return raidBossAggregate;
  }

  async findRaidBossByProps(
    project: Project,
    server: ServerTuple,
    raidBoss: RaidBoss,
  ): Promise<RaidBossConfigDto> {
    const document = await this.raidBossConfigModel.findOne().exec();

    if (!document) {
      return null;
    }

    return document.raidBosses.find(
      (rb) =>
        rb.project === project &&
        rb.server === server &&
        rb.raidBoss === raidBoss,
    );
  }

  async getRaidBosses(): Promise<RaidBossConfigDto[]> {
    const document = await this.raidBossConfigModel.findOne().exec();

    return document.raidBosses;
  }

  async findRaidBossById(id: string): Promise<RaidBossConfigDto> {
    const document = await this.raidBossConfigModel.findOne().exec();

    return document.raidBosses.find((rb) => rb.id === id);
  }

  async saveRaidBossToRead(raidBosses: RaidBossConfigDto[]) {
    await this.raidBossConfigModel.create({
      raidBosses,
    });
  }
}

export const getRaidBossConfigRepositoryConnection = () =>
  MongooseModule.forFeature(
    [{ name: RaidBossConfig.name, schema: RaidBossConfigSchema }],
    'read',
  );
