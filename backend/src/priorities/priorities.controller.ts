import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PrioritiesService } from './priorities.service';

@Controller('priorities')
export class PrioritiesController {
  constructor(private readonly prioritiesService: PrioritiesService) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.prioritiesService.findAll();
  }
}
