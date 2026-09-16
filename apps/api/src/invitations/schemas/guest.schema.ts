import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { randomBytes } from 'node:crypto';

export type GuestDocument = HydratedDocument<Guest>;

export enum GuestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}

@Schema({ timestamps: true })
export class Guest {
  @Prop({ type: Types.ObjectId, ref: 'Invitation', required: true, index: true })
  invitationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'GuestGroup', default: null, index: true })
  groupId?: Types.ObjectId | null;

  @Prop({ default: () => randomBytes(10).toString('hex'), unique: true, index: true })
  publicId!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ lowercase: true, trim: true })
  email?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  personalNote?: string;

  @Prop({ enum: GuestStatus, default: GuestStatus.PENDING })
  status!: GuestStatus;
}

export const GuestSchema = SchemaFactory.createForClass(Guest);
