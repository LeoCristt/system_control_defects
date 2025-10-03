import { Controller, Get, Put, UseGuards, Req, Param, Body } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
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

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user!;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return null;
    }

    if (user.role === 'leader') {
      return this.projectsRepository.findOne({ where: { id: projectId } });
    } else {
      const projectUser = await this.projectUsersRepository.findOne({
        where: { user_id: user.sub, project_id: projectId, has_access: true },
      });
      if (!projectUser) {
        return null;
      }
      return this.projectsRepository.findOne({ where: { id: projectId } });
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('leader')
  @Get('users/:userId/access')
  async getUserProjectAccess(@Param('userId') userId: string) {
    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      return { error: 'Invalid user ID' };
    }
    return this.projectsService.getUserProjectAccess(userIdNum);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('leader')
  @Put('users/:userId/access/:projectId')
  async updateUserProjectAccess(
    @Param('userId') userId: string,
    @Param('projectId') projectId: string,
    @Body('has_access') hasAccess: boolean,
  ) {
    const userIdNum = parseInt(userId, 10);
    const projectIdNum = parseInt(projectId, 10);

    if (isNaN(userIdNum) || isNaN(projectIdNum)) {
      return { error: 'Invalid user ID or project ID' };
    }

    await this.projectsService.updateUserProjectAccess(userIdNum, projectIdNum, hasAccess);
    return { message: 'Access updated successfully' };
  }
}
