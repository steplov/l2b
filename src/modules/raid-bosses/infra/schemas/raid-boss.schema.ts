import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  Project,
  ServerTuple,
  RaidBoss as RaidBossConfig,
} from '@shared/config';

@Schema()
export class RaidBoss {
  @Prop()
  _id: string;

  @Prop()
  project: Project;

  @Prop()
  server: ServerTuple;

  @Prop()
  raidBoss: RaidBossConfig;

  @Prop()
  killDate: Date;

  @Prop()
  min: Date;

  @Prop()
  max: Date;
}

export const RaidBossSchema = SchemaFactory.createForClass(RaidBoss);

export type RaidBossDocument = RaidBoss & Document;
