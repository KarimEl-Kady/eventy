import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { RsvpService } from './rsvp.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';

@Controller('api')
@UseGuards(ThrottlerGuard)
export class RsvpController {
  constructor(private readonly rsvpService: RsvpService) {}

  /** Guest submits RSVP — POST /api/rsvps */
  @Post('rsvps')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  create(@Body() dto: CreateRsvpDto) {
    return this.rsvpService.create(dto);
  }

  /** Couple views RSVPs — GET /api/invitations/:id/rsvps */
  @Get('invitations/:id/rsvps')
  findByInvitation(@Param('id') id: string) {
    return this.rsvpService.findByInvitation(id);
  }
}
