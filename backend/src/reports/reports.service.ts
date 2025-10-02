import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
  ) {}

  findAll(): Promise<Report[]> {
    return this.reportsRepository.find({
      relations: ['project', 'defect', 'generated_by'],
    });
  }

  async create(data: {
    project_id?: number | null;
    defect_id?: number | null;
    title: string;
    content?: string | null;
    file_path?: string | null;
    generated_by: number;
  }): Promise<Report> {
    const report = this.reportsRepository.create({
      project: data.project_id ? { id: data.project_id } as any : null,
      defect: data.defect_id ? { id: data.defect_id } as any : null,
      title: data.title,
      content: data.content,
      file_path: data.file_path,
      generated_by: { id: data.generated_by } as any,
    });
    return this.reportsRepository.save(report);
  }
}
