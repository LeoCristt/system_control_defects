import { Controller, Get, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.commentsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':defectId')
  async findByDefectId(@Param('defectId') defectId: string) {
    const id = parseInt(defectId, 10);
    if (isNaN(id)) {
      throw new Error('Invalid defect ID');
    }
    return this.commentsService.findByDefectId(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() body: { defect_id: number; content: string }, @Req() req: any) {
    const user = req.user!;
    return this.commentsService.create({
      defect_id: body.defect_id,
      user_id: user.sub,
      content: body.content,
    });
  }
}
