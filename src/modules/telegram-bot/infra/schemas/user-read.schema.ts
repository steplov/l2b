import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class UserRead {
  @Prop()
  _id: string;

  @Prop()
  languageCode: string;

  @Prop()
  subscriptions: string[];
}

export const UserReadSchema = SchemaFactory.createForClass(UserRead);

export type UserReadDocument = UserRead & Document;
