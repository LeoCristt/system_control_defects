import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Attachment } from '../attachments/attachment.entity';
import { Defect } from './defect.entity';
import { Project } from '../projects/project.entity';
import { ProjectUser } from '../projects/project-user.entity';
import { User } from '../users/user.entity';
import { DefectsService } from './defects.service';
import { DefectsController } from './defects.controller';
import { AttachmentsService } from '../attachments/attachments.service';
import { StatusesModule } from '../statuses/statuses.module';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Defect, Project, ProjectUser, Attachment, User]),
    MulterModule.register({
      dest: './uploads',
    }),
    StatusesModule,
    HistoryModule,
  ],
  providers: [DefectsService, AttachmentsService],
  controllers: [DefectsController],
  exports: [DefectsService],
})
export class DefectsModule {}
