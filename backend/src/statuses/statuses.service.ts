import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status } from './status.entity';

@Injectable()
export class StatusesService {
  constructor(
    @InjectRepository(Status)
    private statusesRepository: Repository<Status>,
  ) {}

  findAll(): Promise<Status[]> {
    return this.statusesRepository.find();
  }
}
