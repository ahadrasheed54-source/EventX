import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  organizer: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  venue: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true, min: 0 })
  ticketPrice: number;

  @Prop({ required: true, min: 1 })
  totalSeats: number;

  @Prop({ required: true })
  availableSeats: number;

  @Prop({ default: '' })
  image: string;

  @Prop({ default: '' })
  announcement: string;

  @Prop({ enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' })
  status: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
