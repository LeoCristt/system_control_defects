import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.historyService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':defectId')
  async findByDefectId(@Param('defectId') defectId: string) {
    const id = parseInt(defectId, 10);
    if (isNaN(id)) {
      throw new Error('Invalid defect ID');
    }
    return this.historyService.findByDefectId(id);
  }
}
