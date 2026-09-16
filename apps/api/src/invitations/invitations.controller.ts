import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { CreateInvitationInput, InvitationsService, UpdateInvitationInput } from './invitations.service.js';

@Controller('invitations')
@UseGuards(SupabaseAuthGuard)
export class InvitationsController {
  constructor(private readonly service: InvitationsService) {}

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: CreateInvitationInput) {
    return this.service.create(request.user._id, body);
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.service.findAll(request.user._id);
  }

  @Get(':id')
  findOne(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.findOne(request.user._id, id);
  }

  @Patch(':id')
  update(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() body: UpdateInvitationInput) {
    return this.service.update(request.user._id, id, body);
  }

  @Delete(':id')
  remove(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.remove(request.user._id, id);
  }
}
