import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { CreateGuestInput, GuestsService, UpdateGuestInput } from './guests.service.js';

@Controller('invitations/:invitationId/guests')
@UseGuards(SupabaseAuthGuard)
export class GuestsController {
  constructor(private readonly service: GuestsService) {}

  @Post()
  create(@Req() request: AuthenticatedRequest, @Param('invitationId') invitationId: string, @Body() body: CreateGuestInput) {
    return this.service.create(request.user._id, invitationId, body);
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest, @Param('invitationId') invitationId: string) {
    return this.service.findAll(request.user._id, invitationId);
  }

  @Get(':id')
  findOne(@Req() request: AuthenticatedRequest, @Param('invitationId') invitationId: string, @Param('id') id: string) {
    return this.service.findOne(request.user._id, invitationId, id);
  }

  @Patch(':id')
  update(@Req() request: AuthenticatedRequest, @Param('invitationId') invitationId: string, @Param('id') id: string, @Body() body: UpdateGuestInput) {
    return this.service.update(request.user._id, invitationId, id, body);
  }

  @Delete(':id')
  remove(@Req() request: AuthenticatedRequest, @Param('invitationId') invitationId: string, @Param('id') id: string) {
    return this.service.remove(request.user._id, invitationId, id);
  }
}
