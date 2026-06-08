import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Controller('api/invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  create(@Body() dto: CreateInvitationDto) {
    return this.invitationsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invitationsService.findOne(id);
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string) {
    return this.invitationsService.publish(id);
  }

  @Get('public/:slug')
  async findPublic(@Param('slug') slug: string) {
    const invitation = await this.invitationsService.findBySlug(slug);
    if (!invitation) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException(`Invitation not found or not published`);
    }
    return invitation;
  }
}
