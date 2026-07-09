import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  readStatus: boolean;

  // Optional link back to the event that triggered this notification
  @Prop({ type: Types.ObjectId, ref: 'Event', required: false })
  event?: Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
