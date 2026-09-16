import { Controller, Get, Param } from '@nestjs/common';
import { PublicInvitationsService } from './public-invitations.service.js';

@Controller('public/invitations')
export class PublicInvitationsController {
  constructor(private readonly service: PublicInvitationsService) {}

  @Get(':publicId')
  findInvitation(@Param('publicId') publicId: string) {
    return this.service.findInvitation(publicId);
  }

  @Get(':publicId/guests/:guestPublicId')
  findGuestInvitation(
    @Param('publicId') publicId: string,
    @Param('guestPublicId') guestPublicId: string,
  ) {
    return this.service.findGuestInvitation(publicId, guestPublicId);
  }
}
