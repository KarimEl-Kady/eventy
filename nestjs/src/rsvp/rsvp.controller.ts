import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { RsvpService } from './rsvp.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';

@Controller('api')
export class RsvpController {
  constructor(private readonly rsvpService: RsvpService) {}

  /** Guest submits RSVP — POST /api/rsvps */
  @Post('rsvps')
  create(@Body() dto: CreateRsvpDto) {
    return this.rsvpService.create(dto);
  }

  /** Couple views RSVPs — GET /api/invitations/:id/rsvps */
  @Get('invitations/:id/rsvps')
  findByInvitation(@Param('id') id: string) {
    return this.rsvpService.findByInvitation(id);
  }
}
