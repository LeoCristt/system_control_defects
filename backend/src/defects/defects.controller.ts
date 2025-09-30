import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { DefectsService } from './defects.service';

@Controller('defects')
export class DefectsController {
  constructor(private readonly defectsService: DefectsService) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.defectsService.findAll();
  }
}
