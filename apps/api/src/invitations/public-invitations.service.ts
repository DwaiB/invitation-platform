import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema.js';
import { Guest, GuestDocument } from './schemas/guest.schema.js';
import { Invitation, InvitationDocument, InvitationStatus } from './schemas/invitation.schema.js';

@Injectable()
export class PublicInvitationsService {
  constructor(
    @InjectModel(Invitation.name) private readonly invitations: Model<InvitationDocument>,
    @InjectModel(Event.name) private readonly events: Model<EventDocument>,
    @InjectModel(Guest.name) private readonly guests: Model<GuestDocument>,
  ) {}

  private async getPublished(publicId: string) {
    const invitation = await this.invitations.findOne({ publicId, status: InvitationStatus.PUBLISHED }).lean().exec();
    if (!invitation) throw new NotFoundException('Public invitation not found');
    return invitation;
  }

  async findInvitation(publicId: string) {
    const invitation = await this.getPublished(publicId);
    const eventDocuments = await this.events.find({ invitationId: invitation._id }).sort({ date: 1 }).lean().exec();
    const events = eventDocuments.map((event) => ({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      description: event.description,
    }));
    return {
      invitation: {
        publicId: invitation.publicId,
        title: invitation.title,
        type: invitation.type,
        description: invitation.description,
        location: invitation.location,
        eventDate: invitation.eventDate,
        status: invitation.status,
      },
      events,
    };
  }

  async findGuestInvitation(publicId: string, guestPublicId: string) {
    const invitation = await this.getPublished(publicId);
    const guest = await this.guests.findOne({ publicId: guestPublicId, invitationId: invitation._id }).lean().exec();
    if (!guest) throw new NotFoundException('Personalized invitation not found');
    const base = await this.findInvitation(publicId);
    return {
      ...base,
      guest: {
        publicId: guest.publicId,
        name: guest.name,
        personalNote: guest.personalNote,
        status: guest.status,
      },
    };
  }
}
