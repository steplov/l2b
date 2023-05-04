import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RaidBossConfigDto } from '@shared/dto/raid-boss-config.dto';

@Schema()
export class RaidBossConfig {
  @Prop()
  raidBosses: RaidBossConfigDto[];
}

export const RaidBossConfigSchema =
  SchemaFactory.createForClass(RaidBossConfig);

export type RaidBossConfigDocument = RaidBossConfig & Document;
