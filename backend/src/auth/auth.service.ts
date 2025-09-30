import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from './constants';

bcrypt.hash('your_password_here', 10).then(console.log);

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findOne(email);
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: user.username, email: user.email, role: user.role?.name || 'engineer' };
    return {
      access_token: await this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      refresh_token: await this.jwtService.signAsync(payload, { expiresIn: '7d', secret: jwtConstants.refreshSecret }),
    };
  }

  async refresh(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstants.refreshSecret,
      });
      const newPayload = { sub: payload.sub, username: payload.username, email: payload.email, role: payload.role };
      return {
        access_token: await this.jwtService.signAsync(newPayload, { expiresIn: '15m' }),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number, refreshToken: string): Promise<{ message: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstants.refreshSecret,
      });

      // Потом можно добавлять токен в блек лист(но это потом)
      // Пока что тут заглушка
      return {
        message: 'Выход выполнен успешно'
      };
    } catch {
      throw new UnauthorizedException('Неверный refresh token');
    }
  }
}
