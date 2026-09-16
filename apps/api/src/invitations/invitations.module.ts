import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { Invitation, InvitationSchema } from './schemas/invitation.schema.js';
import { Event, EventSchema } from './schemas/event.schema.js';
import { GuestGroup, GuestGroupSchema } from './schemas/guest-group.schema.js';
import { Guest, GuestSchema } from './schemas/guest.schema.js';
import { InvitationsController } from './invitations.controller.js';
import { InvitationsService } from './invitations.service.js';
import { EventsController } from './events.controller.js';
import { EventsService } from './events.service.js';
import { GuestGroupsController } from './guest-groups.controller.js';
import { GuestGroupsService } from './guest-groups.service.js';
import { GuestsController } from './guests.controller.js';
import { GuestsService } from './guests.service.js';
import { PublicInvitationsController } from './public-invitations.controller.js';
import { PublicInvitationsService } from './public-invitations.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invitation.name, schema: InvitationSchema },
      { name: Event.name, schema: EventSchema },
      { name: GuestGroup.name, schema: GuestGroupSchema },
      { name: Guest.name, schema: GuestSchema },
    ]),
    UsersModule,
  ],
  controllers: [InvitationsController, EventsController, GuestGroupsController, GuestsController, PublicInvitationsController],
  providers: [
    InvitationsService,
    EventsService,
    GuestGroupsService,
    GuestsService,
    PublicInvitationsService,
    SupabaseAuthGuard,
  ],
})
export class InvitationsModule {}
