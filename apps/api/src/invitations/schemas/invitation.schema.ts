import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InvitationDocument = HydratedDocument<Invitation>;

export enum InvitationStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

@Schema({ timestamps: true })
export class Invitation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, enum: ['wedding', 'birthday', 'anniversary', 'engagement', 'party', 'baby_shower', 'corporate'] })
  type!: string;

  @Prop({ required: true, unique: true, index: true, trim: true })
  publicId!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  location?: string;

  @Prop({ type: Date })
  eventDate?: Date;

  @Prop({ enum: InvitationStatus, default: InvitationStatus.DRAFT, index: true })
  status!: InvitationStatus;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);
