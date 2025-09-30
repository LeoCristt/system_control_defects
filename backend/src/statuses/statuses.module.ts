import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Status } from './status.entity';
import { StatusesService } from './statuses.service';
import { StatusesController } from './statuses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Status])],
  providers: [StatusesService],
  controllers: [StatusesController],
  exports: [StatusesService],
})
export class StatusesModule {}
