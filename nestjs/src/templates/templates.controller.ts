import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { TemplatesService } from './templates.service';

@Controller('api/templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  findAll() {
    return this.templatesService.findAll();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const template = await this.templatesService.findOne(slug);
    if (!template) throw new NotFoundException(`Template '${slug}' not found`);
    return template;
  }
}
