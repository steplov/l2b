import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Project, ServerTuple, RaidBoss } from '@shared/config';

@Schema()
export class RaidBossRead {
  @Prop()
  _id: string;

  @Prop()
  project: Project;

  @Prop()
  server: ServerTuple;

  @Prop()
  raidBoss: RaidBoss;

  @Prop()
  killDate: Date;

  @Prop()
  min: Date;

  @Prop()
  max: Date;
}

export const RaidBossReadSchema = SchemaFactory.createForClass(RaidBossRead);

export type RaidBossReadDocument = RaidBossRead & Document;
