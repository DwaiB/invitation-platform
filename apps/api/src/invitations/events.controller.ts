import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { CreateEventInput, EventsService, UpdateEventInput } from './events.service.js';

@Controller('invitations/:invitationId/events')
@UseGuards(SupabaseAuthGuard)
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Post()
  create(@Req() request: AuthenticatedRequest, @Param('invitationId') invitationId: string, @Body() body: CreateEventInput) {
    return this.service.create(request.user._id, invitationId, body);
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest, @Param('invitationId') invitationId: string) {
    return this.service.findAll(request.user._id, invitationId);
  }

  @Patch(':id')
  update(@Req() request: AuthenticatedRequest, @Param('invitationId') invitationId: string, @Param('id') id: string, @Body() body: UpdateEventInput) {
    return this.service.update(request.user._id, invitationId, id, body);
  }

  @Delete(':id')
  remove(@Req() request: AuthenticatedRequest, @Param('invitationId') invitationId: string, @Param('id') id: string) {
    return this.service.remove(request.user._id, invitationId, id);
  }
}
