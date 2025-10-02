import { Controller, Get, Post, UseGuards, Req, Body, UseInterceptors, UploadedFile, Param, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ReportsService } from './reports.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/reports',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        const filename = `report-${uniqueSuffix}${ext}`;
        callback(null, filename);
      },
    }),
    fileFilter: (req, file, callback) => {
      // Allow Excel files
      if (!file.originalname.match(/\.(xlsx|xls)$/)) {
        return callback(new Error('Only Excel files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  }))
  async create(@UploadedFile() file: any, @Body() body: any, @Req() req: Request) {
    const user = req.user!;
    const filePath = file ? `/uploads/reports/${file.filename}` : null;

    return this.reportsService.create({
      project_id: body.project_id ? parseInt(body.project_id) : null,
      defect_id: body.defect_id ? parseInt(body.defect_id) : null,
      title: body.title,
      content: body.content || null,
      file_path: filePath,
      generated_by: user.sub,
    });
  }
}
