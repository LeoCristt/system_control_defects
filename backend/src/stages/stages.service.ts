import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stage } from './stage.entity';

@Injectable()
export class StagesService {
  constructor(
    @InjectRepository(Stage)
    private stagesRepository: Repository<Stage>,
  ) {}

  findAll(): Promise<Stage[]> {
    return this.stagesRepository.find({ relations: ['project'] });
  }
}
