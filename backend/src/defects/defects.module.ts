import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Attachment } from '../attachments/attachment.entity';
import { Defect } from './defect.entity';
import { Project } from '../projects/project.entity';
import { ProjectUser } from '../projects/project-user.entity';
import { DefectsService } from './defects.service';
import { DefectsController } from './defects.controller';
import { AttachmentsService } from '../attachments/attachments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Defect, Project, ProjectUser, Attachment]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  providers: [DefectsService, AttachmentsService],
  controllers: [DefectsController],
  exports: [DefectsService],
})
export class DefectsModule {}
