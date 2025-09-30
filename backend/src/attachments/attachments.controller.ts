import { Controller, Get, Post, UseGuards, UseInterceptors, UploadedFile, Param, Req, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AttachmentsService } from './attachments.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.attachmentsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Post('upload/:defectId')
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
        return callback(new BadRequestException('Only image and document files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  }))
  async uploadFile(
    @UploadedFile() file: any,
    @Param('defectId') defectId: string,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const defectIdNum = parseInt(defectId, 10);
    if (isNaN(defectIdNum)) {
      throw new BadRequestException('Invalid defect ID');
    }

    const user = req.user!;
    const filePath = `/uploads/${file.filename}`;

    return this.attachmentsService.create({
      defectId: defectIdNum,
      filePath,
      fileName: file.originalname,
      fileType: file.mimetype,
      uploadedById: user.sub,
    });
  }
}
