
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
  @Roles('leader')
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    if (!registerDto.email || !registerDto.username || !registerDto.password) {
      throw new BadRequestException('Требуются email, имя пользователя и пароль');
    }

    try {
      const user = await this.usersService.create(registerDto.email, registerDto.username, registerDto.password, registerDto.role, registerDto.full_name, registerDto.phone_number, registerDto.address, registerDto.hire_date);
      return {
        message: 'Пользователь успешно зарегистрирован',
        user: { id: user.id, email: user.email, username: user.username, role: user.role?.name }
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

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req, @Body('refresh_token') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Требуется refresh_token');
    }
    return this.authService.logout(req.user.sub, refreshToken);
  }
}
