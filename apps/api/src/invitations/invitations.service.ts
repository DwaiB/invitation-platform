import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'node:crypto';
import { Model, Types } from 'mongoose';
import { IsISO8601, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Invitation, InvitationDocument, InvitationStatus } from './schemas/invitation.schema.js';

export class CreateInvitationInput {
  @IsString() @MinLength(1)
  title: string;
  @IsIn(['wedding', 'birthday', 'anniversary', 'engagement', 'party', 'baby_shower', 'corporate'])
  type: string;
  @IsOptional() @IsString()
  description?: string;
  @IsOptional() @IsString()
  location?: string;
  @IsOptional() @IsISO8601()
  eventDate?: string;
}

export class UpdateInvitationInput extends PartialType(CreateInvitationInput) {
  @IsOptional() @IsIn(Object.values(InvitationStatus))
  status?: InvitationStatus;
}

@Injectable()
export class InvitationsService {
  constructor(@InjectModel(Invitation.name) private readonly model: Model<InvitationDocument>) {}

  create(ownerId: Types.ObjectId, input: CreateInvitationInput) {
    return this.model.create({ ...input, ownerId, publicId: randomBytes(8).toString('hex') });
  }

  findAll(ownerId: Types.ObjectId) {
    return this.model.find({ ownerId }).sort({ createdAt: -1 }).exec();
  }

  findOne(ownerId: Types.ObjectId, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid invitation ID');
    }
    return this.model.findOne({ _id: id, ownerId }).exec().then((invitation) => {
      if (!invitation) throw new NotFoundException('Invitation not found');
      return invitation;
    });
  }

  async update(ownerId: Types.ObjectId, id: string, input: UpdateInvitationInput) {
    const invitation = await this.model.findOneAndUpdate(
      { _id: id, ownerId }, input, { returnDocument: 'after' },
    ).exec();
    if (!invitation) throw new NotFoundException('Invitation not found');
    return invitation;
  }

  async remove(ownerId: Types.ObjectId, id: string) {
    const invitation = await this.model.findOneAndDelete({ _id: id, ownerId }).exec();
    if (!invitation) throw new NotFoundException('Invitation not found');
    return { deleted: true };
  }
}
