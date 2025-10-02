import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Project } from '../projects/project.entity';
import { Defect } from '../defects/defect.entity';
import { User } from '../users/user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project | null;

  @ManyToOne(() => Defect, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'defect_id' })
  defect: Defect | null;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  file_path: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'generated_by' })
  generated_by: User;

  @CreateDateColumn()
  created_at: Date;
}
