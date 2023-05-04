import { Injectable } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ServerTuple, RaidBoss } from '@shared/config';
import { RaidBossConfigDto } from '@shared/dto/raid-boss-config.dto';
import {
  RaidBossConfig,
  RaidBossConfigDocument,
  RaidBossConfigSchema,
} from '../schemas/raid-boss-config.schema';

@Injectable()
export class RaidBossConfigRepository {
  constructor(
    @InjectModel(RaidBossConfig.name)
    private readonly raidBossConfigModel: Model<RaidBossConfigDocument>,
  ) {}

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

    if (!document) return [];

    return document.raidBosses;
  }

  async findRaidBossById(id: string): Promise<RaidBossConfigDto> {
    const document = await this.raidBossConfigModel.findOne().exec();

    return document.raidBosses.find((rb) => rb.id === id);
  }

  async saveRaidBosses(raidBosses: RaidBossConfigDto[]) {
    await this.raidBossConfigModel.deleteMany();
    await this.raidBossConfigModel.create({
      raidBosses,
    });
  }
}

export const getRaidBossConfigRepositoryConnection = () =>
  MongooseModule.forFeature(
    [{ name: RaidBossConfig.name, schema: RaidBossConfigSchema }],
    'l2b',
  );
