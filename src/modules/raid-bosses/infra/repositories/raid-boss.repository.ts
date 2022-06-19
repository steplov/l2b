import { Injectable } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventStore } from '@shared/libs/eventsourcing';
import { RaidBossConfigDto } from '@shared/dto/raid-boss-config.dto';
import { RaidBossAggregate } from '../../domain/entities/raid-boss.aggregate';
import {
  RaidBossRead,
  RaidBossReadDocument,
  RaidBossReadSchema,
} from '../schemas/raid-boss-read.schema';
import {
  RaidBossConfig,
  RaidBossConfigDocument,
} from '../schemas/raid-boss-config.schema';
import { RaidBossReadDto } from '../dto/raid-boss-read.dto';

@Injectable()
export class RaidBossRepository {
  constructor(
    private readonly eventStore: EventStore,
    @InjectModel(RaidBossRead.name)
    private readonly raidBossReadModel: Model<RaidBossReadDocument>,
    @InjectModel(RaidBossConfig.name)
    private readonly raidBossConfigModel: Model<RaidBossConfigDocument>,
  ) {}

  async findOneById(id: string): Promise<RaidBossAggregate> {
    const { project, server, raidBoss } = await this.findRaidBossById(id);
    const raidBossAggregate = new RaidBossAggregate(
      {
        project,
        server,
        raidBoss,
        killDate: new Date('2000-01-01'),
      },
      id,
    );

    const events = await this.eventStore.getEvents('raidBoss', id);

    raidBossAggregate.loadFromHistory(events.events);

    return raidBossAggregate;
  }

  async saveToRaidBossRead(raidBossReadDto: RaidBossReadDto) {
    const _id = raidBossReadDto._id;
    const eventsRaw = await this.raidBossReadModel.findOne({ _id }).exec();

    if (!!eventsRaw) {
      await this.raidBossReadModel.updateOne({ _id }, raidBossReadDto, {
        new: true,
      });
    } else {
      await this.raidBossReadModel.create(raidBossReadDto);
    }
  }

  async getRaidBossReadDataById(id: string): Promise<RaidBossReadDto> {
    return this.raidBossReadModel.findOne({ _id: id }).exec();
  }

  async getRaidBossesReadData(
    project?: string,
    server?: string,
  ): Promise<RaidBossReadDto[]> {
    const query: any = {};

    if (project) {
      query.project = project;
    }
    if (server) {
      query.server = server;
    }

    return this.raidBossReadModel.find(query).exec();
  }

  private async findRaidBossById(id: string): Promise<RaidBossConfigDto> {
    const document = await this.raidBossConfigModel.findOne().exec();

    return document.raidBosses.find((rb) => rb.id === id);
  }
}

export const getRaidBossReadRepositoryConnection = () =>
  MongooseModule.forFeature(
    [{ name: RaidBossRead.name, schema: RaidBossReadSchema }],
    'read',
  );
