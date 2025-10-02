
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private rolesService: RolesService,
  ) {}

  async findOne(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email }, relations: ['role'] });
    return user || undefined;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['role'] });
  }

  async findEngineers(): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('role.name = :roleName', { roleName: 'engineer' })
      .getMany();
  }

  async create(email: string, username: string, password: string, roleName?: string, full_name?: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    let roleId = 2; // default engineer
    if (roleName) {
      const role = await this.rolesService.findOneByName(roleName);
      if (role) roleId = role.id;
    }
    const user = this.usersRepository.create({
      email,
      username,
      password: hashedPassword,
      role_id: roleId,
      full_name: full_name || username,
    });
    return this.usersRepository.save(user);
  }
}
