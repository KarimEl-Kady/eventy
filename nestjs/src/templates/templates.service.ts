import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.template.findMany({
      orderBy: { name: 'asc' },
    });
  }

  findOne(slug: string) {
    return this.prisma.template.findUnique({ where: { slug } });
  }
}
