import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { Request } from 'express';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Req() req: Request) {
    const user = req.user!;
    // user.role is string, so check role string directly
    if (!['leader', 'manager'].includes(user.role)) {
      throw new Error('Access denied');
    }
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('engineers')
  async findEngineers(@Req() req: Request) {
    const user = req.user!;
    if (!['leader', 'manager'].includes(user.role)) {
      throw new Error('Access denied');
    }
    const projectId = req.query.project_id ? parseInt(req.query.project_id as string) : undefined;
    return this.usersService.findEngineers(projectId);
  }

  @UseGuards(AuthGuard)
  @Get(':userId/project-access')
  async getUserProjectAccess(@Param('userId') userId: string, @Req() req: Request) {
    const user = req.user!;
    if (user.role !== 'leader') {
      throw new Error('Access denied');
    }
    return this.usersService.getUserProjectAccess(parseInt(userId));
  }

  @UseGuards(AuthGuard)
  @Post(':userId/project-access/:projectId')
  async grantProjectAccess(
    @Param('userId') userId: string,
    @Param('projectId') projectId: string,
    @Req() req: Request
  ) {
    const user = req.user!;
    if (user.role !== 'leader') {
      throw new Error('Access denied');
    }
    await this.usersService.grantProjectAccess(parseInt(userId), parseInt(projectId));
    return { message: 'Access granted successfully' };
  }

  @UseGuards(AuthGuard)
  @Delete(':userId/project-access/:projectId')
  async revokeProjectAccess(
    @Param('userId') userId: string,
    @Param('projectId') projectId: string,
    @Req() req: Request
  ) {
    const user = req.user!;
    if (user.role !== 'leader') {
      throw new Error('Access denied');
    }
    await this.usersService.revokeProjectAccess(parseInt(userId), parseInt(projectId));
    return { message: 'Access revoked successfully' };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    const user = req.user!;
    return this.usersService.getProfile(user.sub);
  }

  @UseGuards(AuthGuard)
  @Get('profile/projects')
  async getProfileProjects(@Req() req: Request) {
    const user = req.user!;
    return this.usersService.getProfileProjects(user.sub);
  }
}
