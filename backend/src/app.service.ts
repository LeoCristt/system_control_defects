import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { RolesService } from './roles/roles.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async onModuleInit() {
    // Создание ролей
    const roles = ['менеджер', 'инженер', 'руководитель'];
    for (const roleName of roles) {
      const existing = await this.rolesService.findOneByName(roleName);
      if (!existing) {
        await this.rolesService.create({ name: roleName });
      }
    }

    // Создание админа, если его нет
    const adminEmail = 'admin@admin.com';
    const existingAdmin = await this.usersService.findOne(adminEmail);
    if (!existingAdmin) {
      await this.usersService.create(adminEmail, 'admin', 'admin', 'руководитель', 'Admin User');
    }
  }
}
