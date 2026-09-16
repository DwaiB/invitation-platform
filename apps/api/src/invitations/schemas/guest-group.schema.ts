import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GuestGroupDocument = HydratedDocument<GuestGroup>;

@Schema({ timestamps: true })
export class GuestGroup {
  @Prop({ type: Types.ObjectId, ref: 'Invitation', required: true, index: true })
  invitationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;
}

export const GuestGroupSchema = SchemaFactory.createForClass(GuestGroup);
