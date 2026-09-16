import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { CreateGuestGroupInput, GuestGroupsService, UpdateGuestGroupInput } from './guest-groups.service.js';

@Controller('invitations/:invitationId/groups')
@UseGuards(SupabaseAuthGuard)
export class GuestGroupsController {
  constructor(private readonly service: GuestGroupsService) {}

  @Post()
  create(@Req() request: AuthenticatedRequest, @Param('invitationId') invitationId: string, @Body() body: CreateGuestGroupInput) {
    return this.service.create(request.user._id, invitationId, body);
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest, @Param('invitationId') invitationId: string) {
    return this.service.findAll(request.user._id, invitationId);
  }

  @Patch(':id')
  update(@Req() request: AuthenticatedRequest, @Param('invitationId') invitationId: string, @Param('id') id: string, @Body() body: UpdateGuestGroupInput) {
    return this.service.update(request.user._id, invitationId, id, body);
  }

  @Delete(':id')
  remove(@Req() request: AuthenticatedRequest, @Param('invitationId') invitationId: string, @Param('id') id: string) {
    return this.service.remove(request.user._id, invitationId, id);
  }
}
