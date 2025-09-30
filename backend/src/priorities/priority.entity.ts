import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('priorities')
export class Priority {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;
}
