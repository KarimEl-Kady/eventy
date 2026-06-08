import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInvitationDto) {
    return this.prisma.invitation.create({
      data: {
        title: dto.title,
        brideName: dto.brideName,
        groomName: dto.groomName,
        weddingDate: new Date(dto.weddingDate),
        weddingTime: dto.weddingTime,
        venue: dto.venue,
        templateId: dto.templateId,
        status: 'draft',
      },
      include: { template: true },
    });
  }

  async findOne(id: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
      include: { template: true },
    });
    if (!invitation) throw new NotFoundException(`Invitation '${id}' not found`);
    return invitation;
  }
}
