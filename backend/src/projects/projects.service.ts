import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from './project.entity';
import { ProjectUser } from './project-user.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectUser)
    private projectUserRepository: Repository<ProjectUser>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll(): Promise<Project[]> {
    return this.projectsRepository.find({ relations: ['projectUsers'] });
  }

  async getUserProjectAccess(userId: number): Promise<any[]> {
    const projectUsers = await this.projectUserRepository.find({
      where: { user_id: userId },
      relations: ['project'],
    });

    return projectUsers.map(pu => ({
      project_id: pu.project_id,
      project_name: pu.project.name,
      has_access: pu.has_access,
    }));
  }

  async updateUserProjectAccess(userId: number, projectId: number, hasAccess: boolean): Promise<void> {
    await this.projectUserRepository.update(
      { user_id: userId, project_id: projectId },
      { has_access: hasAccess }
    );
  }
}
