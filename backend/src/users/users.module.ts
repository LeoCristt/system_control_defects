import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { RolesModule } from '../roles/roles.module';
import { ProjectUser } from '../projects/project-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ProjectUser]), RolesModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
