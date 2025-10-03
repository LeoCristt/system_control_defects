import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './history.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private historyRepository: Repository<History>,
  ) {}

  findAll(): Promise<History[]> {
    return this.historyRepository.find();
  }

  async create(data: {
    defect_id: number;
    user_id: number;
    action: string;
    old_value?: string;
    new_value?: string;
  }): Promise<History> {
    const history = this.historyRepository.create({
      defect: { id: data.defect_id } as any,
      user: { id: data.user_id } as any,
      action: data.action,
      old_value: data.old_value || null,
      new_value: data.new_value || null,
    });
    return this.historyRepository.save(history);
  }

  async findByDefectId(defectId: number): Promise<History[]> {
    return this.historyRepository.find({
      where: { defect: { id: defectId } },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });
  }
}
