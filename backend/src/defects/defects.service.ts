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
}
