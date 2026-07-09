import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TicketDocument = Ticket & Document;

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  event: Types.ObjectId;

  @Prop({ required: true, unique: true })
  ticketNumber: string;

  @Prop({ enum: ['pending', 'paid'], default: 'paid' })
  paymentStatus: string;

  @Prop({ enum: ['not_attended', 'attended'], default: 'not_attended' })
  attendanceStatus: string;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
