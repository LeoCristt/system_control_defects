import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Defect } from '../defects/defect.entity';
import { User } from '../users/user.entity';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Defect, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'defect_id' })
  defect: Defect;

  @Column({ type: 'varchar', length: 255 })
  file_path: string;

  @Column({ type: 'varchar', length: 100 })
  file_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  file_type: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploaded_by: User;

  @CreateDateColumn()
  created_at: Date;
}
