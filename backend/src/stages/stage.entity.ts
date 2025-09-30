import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../projects/project.entity';

@Entity('stages')
export class Stage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  project_id: number;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'date', nullable: true })
  start_date: string | null;

  @Column({ type: 'date', nullable: true })
  end_date: string | null;
}
