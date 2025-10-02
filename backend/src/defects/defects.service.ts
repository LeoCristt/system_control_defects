import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Defect } from './defect.entity';
import { StatusesService } from '../statuses/statuses.service';

@Injectable()
export class DefectsService {
  constructor(
    @InjectRepository(Defect)
    private defectsRepository: Repository<Defect>,
    private statusesService: StatusesService,
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
    priority_id: number;
  }): Promise<Defect> {
    // Get status with name 'Новый'
    const newStatus = await this.statusesService.findAll().then(statuses => statuses.find(s => s.name === 'Новый'));
    if (!newStatus) {
      throw new Error("Default status 'Новый' not found");
    }

    const defect = this.defectsRepository.create({
      title: data.title,
      description: data.description,
      project: { id: data.project_id } as any,
      stage: data.stage_id ? { id: data.stage_id } as any : null,
      creator: { id: data.creator_id } as any,
      assignee: null,
      priority: { id: data.priority_id } as any,
      status: { id: newStatus.id } as any,
      due_date: null,
    });

    return this.defectsRepository.save(defect);
  }

  async update(id: number, data: Partial<{
    title: string;
    description: string;
    project_id: number;
    stage_id: number;
    assignee_id: number;
    priority_id: number;
    status_id: number;
    due_date: string;
  }>): Promise<Defect> {
    await this.defectsRepository.update(id, {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.project_id && { project: { id: data.project_id } as any }),
      ...(data.stage_id && { stage: { id: data.stage_id } as any }),
      ...(data.assignee_id && { assignee: { id: data.assignee_id } as any }),
      ...(data.priority_id && { priority: { id: data.priority_id } as any }),
      ...(data.status_id && { status: { id: data.status_id } as any }),
      ...(data.due_date && { due_date: data.due_date }),
    });

    const defect = await this.defectsRepository.findOne({
      where: { id },
      relations: ['project', 'stage', 'creator', 'assignee', 'priority', 'status'],
    });

    if (!defect) {
      throw new Error('Defect not found');
    }

    return defect;
  }
}
