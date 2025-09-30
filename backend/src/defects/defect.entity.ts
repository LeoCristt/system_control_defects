import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../projects/project.entity';
import { Stage } from '../stages/stage.entity';
import { User } from '../users/user.entity';
import { Priority } from '../priorities/priority.entity';
import { Status } from '../statuses/status.entity';

@Entity('defects')
export class Defect {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Stage, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'stage_id' })
  stage: Stage | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User | null;

  @ManyToOne(() => Priority)
  @JoinColumn({ name: 'priority_id' })
  priority: Priority;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'status_id' })
  status: Status;

  @Column({ type: 'date', nullable: true })
  due_date: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
