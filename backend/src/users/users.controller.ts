import { Controller, Get, UseGuards, Req } from '@nestjs/common';
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
    return this.usersService.findEngineers();
  }
}
