import { Controller, Get, Post, Put, UseGuards, Req, Param, NotFoundException, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Defect } from './defect.entity';
import { Project } from '../projects/project.entity';
import { ProjectUser } from '../projects/project-user.entity';
import { DefectsService } from './defects.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('defects')
export class DefectsController {
  constructor(
    @InjectRepository(Defect)
    private defectsRepository: Repository<Defect>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectUser)
    private projectUsersRepository: Repository<ProjectUser>,
    private defectsService: DefectsService,
    private attachmentsService: AttachmentsService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Req() req: Request) {
    const user = req.user!;

    if (user.role === 'leader') {
      const defects = await this.defectsRepository.find({
        relations: ['project', 'stage', 'creator', 'assignee', 'priority', 'status'],
      });
      const projects = await this.projectsRepository.find();
      return { defects, projects };
    } else {
      const userId = user.sub;
      const projectUsers = await this.projectUsersRepository.find({
        where: { user_id: userId, has_access: true },
      });
      const projectIds = projectUsers.map(pu => pu.project_id);

      const projects = await this.projectsRepository.find({
        where: { id: In(projectIds) },
      });
      const defects = await this.defectsRepository.find({
        where: { project: { id: In(projectIds) } },
        relations: ['project', 'stage', 'creator', 'assignee', 'priority', 'status'],
      });

      return { defects, projects };
    }
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user!;
    const defectId = parseInt(id, 10);

    if (isNaN(defectId)) {
      throw new NotFoundException('Invalid defect ID');
    }

    const defect = await this.defectsRepository.findOne({
      where: { id: defectId },
      relations: ['project', 'stage', 'creator', 'assignee', 'priority', 'status', 'attachments', 'attachments.uploaded_by'],
    });

    if (!defect) {
      throw new NotFoundException('Defect not found');
    }

    // Check if user has access to this defect's project or is creator/assignee
    const userId = user.sub;
    let hasAccess = false;

    if (user.role === 'leader') {
      hasAccess = true;
    } else {
      // Check project access
      const projectUser = await this.projectUsersRepository.findOne({
        where: { user_id: userId, project_id: defect.project.id, has_access: true },
      });
      if (projectUser) {
        hasAccess = true;
      }
      // Allow creator and assignee access
      if (defect.creator.id === userId || (defect.assignee && defect.assignee.id === userId)) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      throw new NotFoundException('Access denied');
    }

    return defect;
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    const user = req.user!;
    const defectId = parseInt(id, 10);

    if (isNaN(defectId)) {
      throw new NotFoundException('Invalid defect ID');
    }

    // Check if user has access to this defect's project or is creator/assignee
    const defect = await this.defectsRepository.findOne({
      where: { id: defectId },
      relations: ['project', 'creator', 'assignee'],
    });

    if (!defect) {
      throw new NotFoundException('Defect not found');
    }

    const userId = user.sub;
    let hasAccess = false;

    if (user.role === 'leader') {
      hasAccess = true;
    } else {
      // Check project access
      const projectUser = await this.projectUsersRepository.findOne({
        where: { user_id: userId, project_id: defect.project.id, has_access: true },
      });
      if (projectUser) {
        hasAccess = true;
      }
      // Allow creator and assignee access for status changes and comments
      if (defect.creator.id === userId || (defect.assignee && defect.assignee.id === userId)) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      throw new NotFoundException('Access denied');
    }

    return this.defectsService.update(defectId, {
      status_id: body.status_id ? parseInt(body.status_id) : undefined,
      assignee_id: body.assignee_id ? parseInt(body.assignee_id) : undefined,
      due_date: body.due_date || undefined,
    }, userId);
  }

  @UseGuards(AuthGuard)
  @Post('create')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
        callback(null, filename);
      },
    }),
    fileFilter: (req, file, callback) => {
      // Allow images and documents
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx)$/)) {
        return callback(new Error('Only image and document files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  }))
  async createWithAttachment(
    @UploadedFile() file: any,
    @Body() body: any,
    @Req() req: Request,
  ) {
    const user = req.user!;

    // Check if user is engineer
    if (user.role !== 'engineer') {
      throw new NotFoundException('Access denied');
    }

    const projectId = parseInt(body.project_id);

    // Check if user has access to the project
    const projectUser = await this.projectUsersRepository.findOne({
      where: { user_id: user.sub, project_id: projectId, has_access: true },
    });

    if (!projectUser) {
      throw new NotFoundException('Access denied');
    }

    // Create the defect
    const defect = await this.defectsService.create({
      title: body.title,
      description: body.description,
      project_id: projectId,
      stage_id: body.stage_id ? parseInt(body.stage_id) : undefined,
      creator_id: user.sub,
      priority_id: parseInt(body.priority_id),
    });

    // If a file was uploaded, create the attachment
    if (file) {
      const filePath = `/uploads/${file.filename}`;
      await this.attachmentsService.create({
        defectId: defect.id,
        filePath,
        fileName: file.originalname,
        fileType: file.mimetype,
        uploadedById: user.sub,
      });
    }

    // Return the defect with attachments
    return this.defectsRepository.findOne({
      where: { id: defect.id },
      relations: ['project', 'stage', 'creator', 'assignee', 'priority', 'status', 'attachments', 'attachments.uploaded_by'],
    });
  }
}
