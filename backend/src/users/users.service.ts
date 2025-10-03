
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

  async findEngineers(projectId?: number): Promise<User[]> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('role.name = :roleName', { roleName: 'engineer' });

    if (projectId) {
      query
        .leftJoin('user.projectUsers', 'pu')
        .andWhere('pu.project_id = :projectId AND pu.has_access = true', { projectId });
    }

    return query.getMany();
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

  async getProfile(userId: number): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['role', 'projectUsers'],
    });
    if (!user) {
      throw new Error('User not found');
    }

    // Count available projects
    const availableProjectsCount = user.projectUsers.filter(pu => pu.has_access).length;

    // Count closed defects where user is assignee
    const closedDefectsCount = await this.usersRepository.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('defects', 'd')
      .leftJoin('statuses', 's', 'd.status_id = s.id')
      .where('d.assignee_id = :userId AND s.name = :closedStatus', { userId, closedStatus: 'Закрыт' })
      .getRawOne();

    // Count open defects where user is assignee
    const openDefectsCount = await this.usersRepository.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('defects', 'd')
      .leftJoin('statuses', 's', 'd.status_id = s.id')
      .where('d.assignee_id = :userId AND s.name != :closedStatus', { userId, closedStatus: 'Закрыт' })
      .getRawOne();

    return {
      full_name: user.full_name,
      phone_number: user.phone_number,
      address: user.address,
      hire_date: user.hire_date,
      available_projects_count: availableProjectsCount,
      closed_defects_count: parseInt(closedDefectsCount.count),
      open_defects_count: parseInt(openDefectsCount.count),
    };
  }

  async getProfileProjects(userId: number): Promise<any[]> {
    const query = this.usersRepository.manager
      .createQueryBuilder()
      .select('p.id', 'id')
      .addSelect('p.name', 'name')
      .addSelect('p.completion', 'completion')
      .addSelect('p.status', 'status')
      .addSelect('COUNT(CASE WHEN s.name != :closedStatus THEN 1 END)', 'defects_count')
      .from('projects', 'p')
      .leftJoin('project_users', 'pu', 'pu.project_id = p.id')
      .leftJoin('defects', 'd', 'd.project_id = p.id')
      .leftJoin('statuses', 's', 'd.status_id = s.id')
      .where('pu.user_id = :userId AND pu.has_access = true', { userId, closedStatus: 'Закрыт' })
      .groupBy('p.id');

    return query.getRawMany();
  }
}
