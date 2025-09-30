import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Priority } from './priority.entity';

@Injectable()
export class PrioritiesService {
  constructor(
    @InjectRepository(Priority)
    private prioritiesRepository: Repository<Priority>,
  ) {}

  findAll(): Promise<Priority[]> {
    return this.prioritiesRepository.find();
  }
}
