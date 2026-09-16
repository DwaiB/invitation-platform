import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IsString, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { InvitationsService } from './invitations.service.js';
import { GuestGroup, GuestGroupDocument } from './schemas/guest-group.schema.js';

export class CreateGuestGroupInput {
  @IsString() @MinLength(1)
  name!: string;
}
export class UpdateGuestGroupInput extends PartialType(CreateGuestGroupInput) {}

@Injectable()
export class GuestGroupsService {
  constructor(
    @InjectModel(GuestGroup.name) private readonly model: Model<GuestGroupDocument>,
    private readonly invitations: InvitationsService,
  ) {}

  async create(ownerId: Types.ObjectId, invitationId: string, input: CreateGuestGroupInput) {
    await this.invitations.findOne(ownerId, invitationId);
    return this.model.create({
      ...input,
      ownerId,
      invitationId: new Types.ObjectId(invitationId),
    });
  }

  findAll(ownerId: Types.ObjectId, invitationId: string) {
    return this.model.find({ ownerId, invitationId }).sort({ name: 1 }).exec();
  }

  async update(ownerId: Types.ObjectId, invitationId: string, id: string, input: UpdateGuestGroupInput) {
    const group = await this.model.findOneAndUpdate(
      { _id: id, ownerId, invitationId }, input, { returnDocument: 'after' },
    ).exec();
    if (!group) throw new NotFoundException('Guest group not found');
    return group;
  }

  async remove(ownerId: Types.ObjectId, invitationId: string, id: string) {
    const group = await this.model.findOneAndDelete({ _id: id, ownerId, invitationId }).exec();
    if (!group) throw new NotFoundException('Guest group not found');
    return { deleted: true };
  }
}
