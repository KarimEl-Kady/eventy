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

  async publish(id: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { id } });
    if (!invitation) throw new NotFoundException(`Invitation '${id}' not found`);
    if (invitation.status === 'published') {
      // Already published — return as-is (idempotent)
      return this.prisma.invitation.findUnique({ where: { id }, include: { template: true } });
    }

    // Generate a short unique slug: first 8 chars of a hex random + suffix
    const { randomBytes } = await import('crypto');
    const publicSlug = randomBytes(4).toString('hex') + '-' + id.slice(0, 4);

    return this.prisma.invitation.update({
      where: { id },
      data: { status: 'published', slug: publicSlug },
      include: { template: true },
    });
  }

  async findBySlug(slug: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { slug },
      include: { template: true },
    });
    // Return null (not NotFoundException) — controller decides the HTTP status
    if (!invitation || invitation.status !== 'published') return null;
    return invitation;
  }
}
