import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { RolesModule } from './roles/roles.module';
import { Role } from './roles/role.entity';
import { ProjectsModule } from './projects/projects.module';
import { Project } from './projects/project.entity';
import { StagesModule } from './stages/stages.module';
import { Stage } from './stages/stage.entity';
import { StatusesModule } from './statuses/statuses.module';
import { Status } from './statuses/status.entity';
import { PrioritiesModule } from './priorities/priorities.module';
import { Priority } from './priorities/priority.entity';
import { DefectsModule } from './defects/defects.module';
import { Defect } from './defects/defect.entity';
import { CommentsModule } from './comments/comments.module';
import { Comment } from './comments/comment.entity';
import { AttachmentsModule } from './attachments/attachments.module';
import { Attachment } from './attachments/attachment.entity';
import { HistoryModule } from './history/history.module';
import { History } from './history/history.entity';
import { ReportsModule } from './reports/reports.module';
import { Report } from './reports/report.entity';
import { ProjectUser } from './projects/project-user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'password'),
        database: config.get<string>('DB_NAME', 'defects_analysis'),
        entities: [User, Role, Project, ProjectUser, Stage, Status, Priority, Defect, Comment, Attachment, History, Report],
        synchronize: true,
        logging: true,
      }),
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    ProjectsModule,
    StagesModule,
    StatusesModule,
    PrioritiesModule,
    DefectsModule,
    CommentsModule,
    AttachmentsModule,
    HistoryModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
