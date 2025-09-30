import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { ProjectUser } from './project-user.entity';
import { Defect } from '../defects/defect.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => ProjectUser, projectUser => projectUser.project)
  projectUsers: ProjectUser[];

  @OneToMany(() => Defect, defect => defect.project)
  defects: Defect[];

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'date', nullable: true })
  start_date: string | null;

  @Column({ type: 'date', nullable: true })
  end_date: string | null;
}
