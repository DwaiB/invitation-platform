import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IsEmail, IsIn, IsISO8601, IsOptional, IsString, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { InvitationsService } from './invitations.service.js';
import { GuestGroup, GuestGroupDocument } from './schemas/guest-group.schema.js';
import { Guest, GuestDocument, GuestStatus } from './schemas/guest.schema.js';

export class CreateGuestInput {
  @IsString() @MinLength(1)
  name: string;
  @IsOptional() @IsEmail()
  email?: string;
  @IsOptional() @IsString()
  phone?: string;
  @IsOptional() @IsString()
  personalNote?: string;
  @IsOptional() @IsString()
  groupId?: string | null;
}

export class UpdateGuestInput extends PartialType(CreateGuestInput) {
  @IsOptional() @IsIn(Object.values(GuestStatus))
  status?: GuestStatus;
}

@Injectable()
export class GuestsService {
  constructor(
    @InjectModel(Guest.name) private readonly model: Model<GuestDocument>,
    @InjectModel(GuestGroup.name) private readonly groupModel: Model<GuestGroupDocument>,
    private readonly invitations: InvitationsService,
  ) {}

  private async resolveGroup(ownerId: Types.ObjectId, invitationId: string, groupId?: string | null) {
    if (!groupId) return null;
    const group = await this.groupModel.findOne({ _id: groupId, ownerId, invitationId }).exec();
    if (!group) throw new BadRequestException('Guest group does not belong to this invitation');
    return group._id;
  }

  async create(ownerId: Types.ObjectId, invitationId: string, input: CreateGuestInput) {
    await this.invitations.findOne(ownerId, invitationId);
    const groupId = await this.resolveGroup(ownerId, invitationId, input.groupId);
    return this.model.create({ ...input, groupId, ownerId, invitationId: new Types.ObjectId(invitationId) });
  }

  findAll(ownerId: Types.ObjectId, invitationId: string) {
    return this.invitations.findOne(ownerId, invitationId).then(() =>
      this.model.find({ invitationId }).sort({ createdAt: -1 }).exec(),
    );
  }

  async findOne(ownerId: Types.ObjectId, invitationId: string, id: string) {
    await this.invitations.findOne(ownerId, invitationId);
    const guest = await this.model.findOne({ _id: id, invitationId }).exec();
    if (!guest) throw new NotFoundException('Guest not found');
    return guest;
  }

  async update(ownerId: Types.ObjectId, invitationId: string, id: string, input: UpdateGuestInput) {
    await this.invitations.findOne(ownerId, invitationId);
    const { groupId: requestedGroupId, ...changes } = input;
    const update = requestedGroupId === undefined
      ? changes
      : { ...changes, groupId: await this.resolveGroup(ownerId, invitationId, requestedGroupId) };
    const guest = await this.model.findOneAndUpdate(
      { _id: id, invitationId }, update, { returnDocument: 'after' },
    ).exec();
    if (!guest) throw new NotFoundException('Guest not found');
    return guest;
  }

  async remove(ownerId: Types.ObjectId, invitationId: string, id: string) {
    await this.invitations.findOne(ownerId, invitationId);
    const guest = await this.model.findOneAndDelete({ _id: id, invitationId }).exec();
    if (!guest) throw new NotFoundException('Guest not found');
    return { deleted: true };
  }
}
