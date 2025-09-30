import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('statuses')
export class Status {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;
}
