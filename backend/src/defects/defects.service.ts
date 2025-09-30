import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Defect } from './defect.entity';

@Injectable()
export class DefectsService {
  constructor(
    @InjectRepository(Defect)
    private defectsRepository: Repository<Defect>,
  ) {}

  findAll(): Promise<Defect[]> {
    return this.defectsRepository.find();
  }

  async create(data: {
    title: string;
    description: string;
    project_id: number;
    stage_id?: number;
    creator_id: number;
    assignee_id?: number;
    priority_id: number;
    status_id: number;
    due_date?: string;
  }): Promise<Defect> {
    const defect = this.defectsRepository.create({
      title: data.title,
      description: data.description,
      project: { id: data.project_id } as any,
      stage: data.stage_id ? { id: data.stage_id } as any : null,
      creator: { id: data.creator_id } as any,
      assignee: data.assignee_id ? { id: data.assignee_id } as any : null,
      priority: { id: data.priority_id } as any,
      status: { id: data.status_id } as any,
      due_date: data.due_date || null,
    });

    return this.defectsRepository.save(defect);
  }
}
