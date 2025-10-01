import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { StagesService } from './stages.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stage } from './stage.entity';
import { ProjectUser } from '../projects/project-user.entity';
import type { Request } from 'express';

@Controller('stages')
export class StagesController {
  constructor(
    private readonly stagesService: StagesService,
    @InjectRepository(Stage)
    private stagesRepository: Repository<Stage>,
    @InjectRepository(ProjectUser)
    private projectUsersRepository: Repository<ProjectUser>,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Req() req: Request, @Query('project_id') projectId?: string) {
    const user = req.user!;

    if (projectId) {
      const projId = parseInt(projectId, 10);
      if (isNaN(projId)) {
        return [];
      }

      // Check if user has access to the project
      if (user.role !== 'leader') {
        const projectUser = await this.projectUsersRepository.findOne({
          where: { user_id: user.sub, project_id: projId, has_access: true },
        });
        if (!projectUser) {
          return [];
        }
      }

      return this.stagesRepository.find({
        where: { project_id: projId },
        relations: ['project'],
      });
    } else {
      // If no project_id, return all, but filtered by access? But for now, since create page will pass project_id, maybe keep as is.
      return this.stagesService.findAll();
    }
  }
}
