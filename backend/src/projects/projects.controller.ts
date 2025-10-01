import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ProjectsService } from './projects.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from './project.entity';
import { ProjectUser } from './project-user.entity';
import type { Request } from 'express';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectUser)
    private projectUsersRepository: Repository<ProjectUser>,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Req() req: Request) {
    const user = req.user!;

    if (user.role === 'leader') {
      return this.projectsService.findAll();
    } else {
      const userId = user.sub;
      const projectUsers = await this.projectUsersRepository.find({
        where: { user_id: userId, has_access: true },
      });
      const projectIds = projectUsers.map(pu => pu.project_id);

      return this.projectsRepository.find({
        where: { id: In(projectIds) },
      });
    }
  }
}
