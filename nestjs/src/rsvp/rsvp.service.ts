import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';

@Injectable()
export class RsvpService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRsvpDto) {
    // Verify invitation exists and is published
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: dto.invitationId },
    });
    if (!invitation || invitation.status !== 'published') {
      throw new NotFoundException('Invitation not found or not published');
    }

    return this.prisma.rsvp.create({
      data: {
        invitationId: dto.invitationId,
        guestName: dto.guestName,
        attendanceStatus: dto.attendanceStatus,
        guestCount: dto.guestCount,
        notes: dto.notes ?? null,
      },
    });
  }

  findByInvitation(invitationId: string) {
    return this.prisma.rsvp.findMany({
      where: { invitationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
