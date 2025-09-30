import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Defect } from '../defects/defect.entity';
import { User } from '../users/user.entity';

@Entity('history')
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Defect, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'defect_id' })
  defect: Defect;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'text', nullable: true })
  old_value: string | null;

  @Column({ type: 'text', nullable: true })
  new_value: string | null;

  @CreateDateColumn()
  created_at: Date;
}
