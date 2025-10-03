import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Defect } from './defect.entity';
import { StatusesService } from '../statuses/statuses.service';
import { HistoryService } from '../history/history.service';
import { User } from '../users/user.entity';

@Injectable()
export class DefectsService {
  constructor(
    @InjectRepository(Defect)
    private defectsRepository: Repository<Defect>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private statusesService: StatusesService,
    private historyService: HistoryService,
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
    const newStatus = await this.statusesService.findAll().then(statuses => statuses.find(s => s.name === 'Новый'));
    if (!newStatus) {
      throw new Error("Базовый статус 'Новый' не определен");
    }

    const defect = this.defectsRepository.create({
      title: data.title,
      description: data.description,
      project: { id: data.project_id } as any,
      stage: data.stage_id ? { id: data.stage_id } as any : null,
      creator: { id: data.creator_id } as any,
      assignee: null,
      manager: null,
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
  }>, userId?: number, userRole?: string): Promise<Defect> {
    const oldDefect = await this.defectsRepository.findOne({
      where: { id },
      relations: ['status', 'assignee', 'manager'],
    });
    if (!oldDefect) {
      throw new Error('Дефект не найден');
    }

    if (data.status_id) {
      const newStatus = await this.statusesService.findAll().then(statuses => statuses.find(s => s.id === data.status_id));
      if (!newStatus) {
        throw new Error('Некорректный статус id');
      }
      // Изменение доступа с "Новый" на "В работе" (для менеджеров)
      if (oldDefect.status.name === 'Новый' && newStatus.name === 'В работе') {
        if (userRole !== 'manager') {
          throw new Error('Только менеджеры могут поменять статус с "Новый" на "В работе"');
        }
      }
      // Изменение доступа с "В работе" на "На проверке" (для назначенного инженера)
      else if (oldDefect.status.name === 'В работе' && newStatus.name === 'На проверке') {
        if (!userId || !oldDefect.assignee || oldDefect.assignee.id !== userId) {
          throw new Error('Только назначенные иженеры могут поменять статус с "В работе" на "На проверке"');
        }
      }
      // Изменение доступа с "На проверке" на "Закрыт" (для менеджеров)
      else if (oldDefect.status.name === 'На проверке' && newStatus.name === 'Закрыт') {
        if (userRole !== 'manager') {
          throw new Error('Только менеджеры могут поменять статус на "Закрыт"');
        }
      }
      else {
        throw new Error('Некорректное изменение статуса');
      }
    }

    // Set manager_id if manager changes status for the first time
    if (data.status_id && userRole === 'manager' && !oldDefect.manager) {
      await this.defectsRepository.update(id, { manager: { id: userId } as any });
    }

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
      relations: ['project', 'stage', 'creator', 'assignee', 'manager', 'priority', 'status'],
    });

    if (!defect) {
      throw new Error('Defect not found');
    }

    // Запись в историю изменений
    if (userId) {
      if (data.status_id && oldDefect.status.id !== data.status_id) {
        const newStatus = await this.statusesService.findAll().then(statuses => statuses.find(s => s.id === data.status_id));
        await this.historyService.create({
          defect_id: id,
          user_id: userId,
          action: 'status_changed',
          old_value: oldDefect.status.name,
          new_value: newStatus?.name,
        });
      }

      // изменение исполнителя
      if (data.assignee_id !== undefined && (oldDefect.assignee?.id !== data.assignee_id)) {
        const oldAssigneeName = oldDefect.assignee ? `${oldDefect.assignee['full_name'] || oldDefect.assignee['username']}` : 'Не назначен';
        let newAssigneeName = 'Не назначен';
        if (data.assignee_id) {
          const newAssignee = await this.usersRepository.findOne({ where: { id: data.assignee_id } });
          if (newAssignee) {
            newAssigneeName = `${newAssignee.full_name || newAssignee.username}`;
          }
        }
        await this.historyService.create({
          defect_id: id,
          user_id: userId,
          action: 'assignee_changed',
          old_value: oldAssigneeName,
          new_value: newAssigneeName,
        });
      }

      // Изменение срока устранения
      if (data.due_date !== undefined && oldDefect.due_date !== data.due_date) {
        const oldDueDate = oldDefect.due_date ? new Date(oldDefect.due_date).toLocaleDateString('ru-RU') : 'Не устранено';
        const newDueDate = data.due_date ? new Date(data.due_date).toLocaleDateString('ru-RU') : 'Не устранено';
        await this.historyService.create({
          defect_id: id,
          user_id: userId,
          action: 'due_date_changed',
          old_value: oldDueDate,
          new_value: newDueDate,
        });
      }
    }

    return defect;
  }
}
