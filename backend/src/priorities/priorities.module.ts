import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Priority } from './priority.entity';
import { PrioritiesService } from './priorities.service';
import { PrioritiesController } from './priorities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Priority])],
  providers: [PrioritiesService],
  controllers: [PrioritiesController],
  exports: [PrioritiesService],
})
export class PrioritiesModule {}
