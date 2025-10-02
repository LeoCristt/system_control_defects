import { Controller, Get, Post, Put, UseGuards, Req, Param, NotFoundException, UseInterceptors, UploadedFile, Body, Res } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { Request, Response } from 'express';
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

    try {
      return await this.defectsService.update(defectId, {
        status_id: body.status_id ? parseInt(body.status_id) : undefined,
        assignee_id: body.assignee_id ? parseInt(body.assignee_id) : undefined,
        due_date: body.due_date || undefined,
      }, userId, user.role);
    } catch (error) {
      if (error instanceof Error) {
        throw new NotFoundException(error.message);
      }
      throw new NotFoundException('Failed to update defect');
    }
  }

  @UseGuards(AuthGuard)
  @Get(':id/report')
  async generateReport(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const user = req.user!;
    const defectId = parseInt(id, 10);

    if (isNaN(defectId)) {
      throw new NotFoundException('Invalid defect ID');
    }

    // Check if user has access to this defect's project
    const defect = await this.defectsRepository.findOne({
      where: { id: defectId },
      relations: ['project', 'stage', 'creator', 'assignee', 'priority', 'status', 'attachments', 'attachments.uploaded_by'],
    });

    if (!defect) {
      throw new NotFoundException('Defect not found');
    }

    // Only managers can generate reports
    if (user.role !== 'manager') {
      throw new NotFoundException('Access denied');
    }

    // Check if user has access to this defect's project
    const projectUser = await this.projectUsersRepository.findOne({
      where: { user_id: user.sub, project_id: defect.project.id, has_access: true },
    });

    if (!projectUser) {
      throw new NotFoundException('Access denied');
    }

    // Generate Excel report
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Отчёт по дефекту');

    // Title
    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = `Отчёт по дефекту #${defect.id}`;
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Basic information
    worksheet.getCell('A3').value = 'Название:';
    worksheet.getCell('B3').value = defect.title;

    worksheet.getCell('A4').value = 'Проект:';
    worksheet.getCell('B4').value = defect.project.name;

    worksheet.getCell('A5').value = 'Стадия:';
    worksheet.getCell('B5').value = defect.stage ? defect.stage.name : 'Не указана';

    worksheet.getCell('A6').value = 'Приоритет:';
    worksheet.getCell('B6').value = defect.priority.name;

    worksheet.getCell('A7').value = 'Статус:';
    worksheet.getCell('B7').value = defect.status.name;

    worksheet.getCell('A8').value = 'Создатель:';
    worksheet.getCell('B8').value = defect.creator.full_name || defect.creator.username;

    worksheet.getCell('A9').value = 'Исполнитель:';
    worksheet.getCell('B9').value = defect.assignee ? (defect.assignee.full_name || defect.assignee.username) : 'Не назначен';

    worksheet.getCell('A10').value = 'Дата создания:';
    worksheet.getCell('B10').value = new Date(defect.created_at).toLocaleDateString('ru-RU');

    worksheet.getCell('A11').value = 'Дата устранения:';
    worksheet.getCell('B11').value = defect.due_date ? new Date(defect.due_date).toLocaleDateString('ru-RU') : 'Не устранено';

    // Description
    worksheet.getCell('A13').value = 'Описание:';
    worksheet.mergeCells('A13:E13');
    worksheet.getCell('A13').font = { bold: true };

    worksheet.getCell('A14').value = defect.description;
    worksheet.mergeCells('A14:E16');
    worksheet.getCell('A14').alignment = { wrapText: true };

    // Attachments
    if (defect.attachments && defect.attachments.length > 0) {
      worksheet.getCell('A18').value = 'Прикрепленные файлы:';
      worksheet.mergeCells('A18:E18');
      worksheet.getCell('A18').font = { bold: true };

      defect.attachments.forEach((attachment, index) => {
        worksheet.getCell(`A${19 + index}`).value = attachment.fileName;
        worksheet.getCell(`B${19 + index}`).value = attachment.fileType;
        worksheet.getCell(`C${19 + index}`).value = attachment.uploaded_by ? (attachment.uploaded_by.full_name || attachment.uploaded_by.username) : 'Неизвестно';
        worksheet.getCell(`D${19 + index}`).value = new Date(attachment.created_at).toLocaleDateString('ru-RU');
      });
    }

    // Comments section
    const comments = await this.defectsRepository.manager.query(`
      SELECT c.content, c.created_at, u.full_name, u.username
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.defect_id = $1
      ORDER BY c.created_at ASC
    `, [defectId]);

    if (comments.length > 0) {
      const startRow = defect.attachments && defect.attachments.length > 0 ? 21 + defect.attachments.length : 20;

      worksheet.getCell(`A${startRow}`).value = 'Комментарии:';
      worksheet.mergeCells(`A${startRow}:E${startRow}`);
      worksheet.getCell(`A${startRow}`).font = { bold: true };

      comments.forEach((comment: any, index: number) => {
        const row = startRow + 1 + index * 2;
        worksheet.getCell(`A${row}`).value = `${comment.full_name || comment.username} (${new Date(comment.created_at).toLocaleDateString('ru-RU')}):`;
        worksheet.getCell(`A${row}`).font = { bold: true };
        worksheet.getCell(`A${row + 1}`).value = comment.content;
        worksheet.mergeCells(`A${row + 1}:E${row + 1}`);
        worksheet.getCell(`A${row + 1}`).alignment = { wrapText: true };
      });
    }

    // Set column widths
    worksheet.getColumn('A').width = 20;
    worksheet.getColumn('B').width = 30;
    worksheet.getColumn('C').width = 20;
    worksheet.getColumn('D').width = 15;
    worksheet.getColumn('E').width = 15;

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=defect-${defectId}-report.xlsx`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
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
