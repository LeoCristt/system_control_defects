import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  findAll(): Promise<Comment[]> {
    return this.commentsRepository.find();
  }

  async create(data: { defect_id: number; user_id: number; content: string }): Promise<Comment> {
    const comment = this.commentsRepository.create({
      defect: { id: data.defect_id } as any,
      user: { id: data.user_id } as any,
      content: data.content,
    });
    return this.commentsRepository.save(comment);
  }

  async findByDefectId(defectId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { defect: { id: defectId } },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });
  }
}
