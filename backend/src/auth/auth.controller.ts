
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './register.dto';
import { UserRole } from '../users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    if (!signInDto || !signInDto.email || !signInDto.password) {
      throw new BadRequestException('Требуются email и пароль');
    }
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Требуется refresh_token');
    }
    return this.authService.refresh(refreshToken);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.LEADER)
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    if (!registerDto.email || !registerDto.username || !registerDto.password) {
      throw new BadRequestException('Требуются email, имя пользователя и пароль');
    }

    if (registerDto.role === 'leader') {
      throw new BadRequestException('Невозможно выдать роль руководителя(обратитесь к разработчикам)');
    }

    try {
      const user = await this.usersService.create(registerDto.email, registerDto.username, registerDto.password, registerDto.role);
      return {
        message: 'Пользователь успешно зарегистрирован',
        user: { id: user.id, email: user.email, username: user.username, role: user.role }
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Email или имя пользователя уже существует');
      }
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
