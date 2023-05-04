import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User {
  @Prop()
  _id: string;

  @Prop()
  languageCode: string;

  @Prop()
  subscriptions: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & Document;
