import { Controller, Post, Get, Param, Body } from '@nestjs/common';
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
}
