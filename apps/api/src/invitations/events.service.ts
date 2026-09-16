import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IsISO8601, IsOptional, IsString, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Event, EventDocument } from './schemas/event.schema.js';
import { InvitationsService } from './invitations.service.js';

export class CreateEventInput {
  @IsString() @MinLength(1)
  title: string;
  @IsISO8601()
  date: string;
  @IsOptional() @IsString()
  startTime?: string;
  @IsOptional() @IsString()
  endTime?: string;
  @IsOptional() @IsString()
  location?: string;
  @IsOptional() @IsString()
  description?: string;
}

export class UpdateEventInput extends PartialType(CreateEventInput) {}

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private readonly model: Model<EventDocument>,
    private readonly invitations: InvitationsService,
  ) {}

  async create(ownerId: Types.ObjectId, invitationId: string, input: CreateEventInput) {
    await this.invitations.findOne(ownerId, invitationId);
    return this.model.create({
      ...input,
      ownerId,
      invitationId: new Types.ObjectId(invitationId),
    });
  }

  findAll(ownerId: Types.ObjectId, invitationId: string) {
    return this.model.find({ ownerId, invitationId }).sort({ date: 1 }).exec();
  }

  async update(ownerId: Types.ObjectId, invitationId: string, id: string, input: UpdateEventInput) {
    const event = await this.model.findOneAndUpdate(
      { _id: id, ownerId, invitationId },
      input,
      { returnDocument: 'after' },
    ).exec();
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async remove(ownerId: Types.ObjectId, invitationId: string, id: string) {
    const event = await this.model.findOneAndDelete({ _id: id, ownerId, invitationId }).exec();
    if (!event) throw new NotFoundException('Event not found');
    return { deleted: true };
  }
}
