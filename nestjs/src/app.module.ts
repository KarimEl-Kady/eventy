import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TemplatesModule } from './templates/templates.module';
import { InvitationsModule } from './invitations/invitations.module';

@Module({
  imports: [PrismaModule, TemplatesModule, InvitationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
