import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { StagesService } from './stages.service';

@Controller('stages')
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.stagesService.findAll();
  }
}
