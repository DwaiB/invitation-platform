import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema({ timestamps: true })
export class Event {
  @Prop({ type: Types.ObjectId, ref: 'Invitation', required: true, index: true })
  invitationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ type: Date, required: true })
  date!: Date;

  @Prop({ trim: true })
  startTime?: string;

  @Prop({ trim: true })
  endTime?: string;

  @Prop({ trim: true })
  location?: string;

  @Prop({ trim: true })
  description?: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
