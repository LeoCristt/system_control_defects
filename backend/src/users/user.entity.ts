import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  ENGINEER = 'engineer',
  MANAGER = 'manager',
  LEADER = 'leader'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ENGINEER
  })
  role: UserRole;
}
