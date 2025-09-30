import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './attachment.entity';
import { Defect } from '../defects/defect.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
  ) {}

  findAll(): Promise<Attachment[]> {
    return this.attachmentsRepository.find();
  }

  async create(data: {
    defectId: number;
    filePath: string;
    fileName: string;
    fileType: string;
    uploadedById: number;
  }): Promise<Attachment> {
    const attachment = this.attachmentsRepository.create({
      defect: { id: data.defectId } as Defect,
      file_path: data.filePath,
      file_name: data.fileName,
      file_type: data.fileType,
      uploaded_by: { id: data.uploadedById } as User,
    });

    return this.attachmentsRepository.save(attachment);
  }
}
