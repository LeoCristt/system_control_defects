import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { RolesService } from './roles/roles.service';
import { ProjectsService } from './projects/projects.service';
import { DefectsService } from './defects/defects.service';
import { PrioritiesService } from './priorities/priorities.service';
import { StatusesService } from './statuses/statuses.service';
import { StagesService } from './stages/stages.service';
import { AttachmentsService } from './attachments/attachments.service';
import { ReportsService } from './reports/reports.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
    private projectsService: ProjectsService,
    private defectsService: DefectsService,
    private prioritiesService: PrioritiesService,
    private statusesService: StatusesService,
    private stagesService: StagesService,
    private attachmentsService: AttachmentsService,
    private reportsService: ReportsService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async onModuleInit() {
    // Создание ролей
    const roles = ['manager', 'engineer', 'leader'];
    for (const roleName of roles) {
      const existing = await this.rolesService.findOneByName(roleName);
      if (!existing) {
        await this.rolesService.create({ name: roleName });
      }
    }

    // Создание админа, если его нет
    const adminEmail = 'admin@admin.com';
    const existingAdmin = await this.usersService.findOne(adminEmail);
    if (!existingAdmin) {
      await this.usersService.create(adminEmail, 'admin', 'admin', 'leader', 'Admin User');
    }

    // Создание менеджера, если его нет
    const managerEmail = 'manager@manager.com';
    const existingManager = await this.usersService.findOne(managerEmail);
    if (!existingManager) {
      await this.usersService.create(managerEmail, 'manager', 'manager', 'manager', 'Manager User');
    }

    // Создание инженера, если его нет
    const engineerEmail = 'engineer@engineer.com';
    const existingEngineer = await this.usersService.findOne(engineerEmail);
    if (!existingEngineer) {
      await this.usersService.create(engineerEmail, 'engineer', 'engineer', 'engineer', 'Engineer User');
    }

    // Создание приоритетов
    const priorityNames = ['Низкий', 'Средний', 'Высокий'];
    for (const name of priorityNames) {
      const existing = (await this.prioritiesService.findAll()).find(p => p.name === name);
      if (!existing) {
        await this.prioritiesService['prioritiesRepository'].save({ name });
      }
    }

    // Создание статусов
    const statusNames = ['Новый', 'В работе','На проверке', 'Закрыт'];
    for (const name of statusNames) {
      const existing = (await this.statusesService.findAll()).find(s => s.name === name);
      if (!existing) {
        await this.statusesService['statusesRepository'].save({ name });
      }
    }

    // Создание проектов
    const projectsData = [
      { name: 'Проект А', description: 'Описание проекта А', start_date: '2023-01-01', end_date: '2023-12-31' },
      { name: 'Проект Б', description: 'Описание проекта Б', start_date: '2023-02-01', end_date: '2023-11-30' },
    ];
    for (const proj of projectsData) {
      const existing = (await this.projectsService.findAll()).find(p => p.name === proj.name);
      if (!existing) {
        await this.projectsService['projectsRepository'].save(proj);
      }
    }

    // Создание этапов для проектов
    const projectList = await this.projectsService.findAll();
    for (const project of projectList) {
      const stagesData = [
        { project_id: project.id, name: 'Этап 1', description: 'Начальный этап', start_date: '2023-01-01', end_date: '2023-03-31' },
        { project_id: project.id, name: 'Этап 2', description: 'Основной этап', start_date: '2023-04-01', end_date: '2023-09-30' },
      ];
      for (const stage of stagesData) {
        const existingStages = await this.stagesService['stagesRepository'].find({ where: { project_id: project.id, name: stage.name } });
        if (existingStages.length === 0) {
          await this.stagesService['stagesRepository'].save(stage);
        }
      }
    }
    const priorities = await this.prioritiesService.findAll();
    const statuses = await this.statusesService.findAll();
    const stages = await this.stagesService['stagesRepository'].find();
    const users = await this.usersService['usersRepository'].find();
    const projects = await this.projectsService.findAll();

    const defectsData = [
      {
        title: 'Дефект 1',
        description: 'Описание дефекта 1',
        project_id: projects[0].id,
        stage_id: stages.find(s => s.project_id === projects[0].id)?.id,
        creator_id: users[0].id,
        assignee_id: users[1].id,
        priority_id: priorities.find(p => p.name === 'Высокий')!.id,
        status_id: statuses.find(s => s.name === 'Новый')!.id,
        due_date: '2023-07-01',
      },
      {
        title: 'Дефект 2',
        description: 'Описание дефекта 2',
        project_id: projects[1].id,
        stage_id: stages.find(s => s.project_id === projects[1].id)?.id,
        creator_id: users[1].id,
        assignee_id: users[0].id,
        priority_id: priorities.find(p => p.name === 'Средний')!.id,
        status_id: statuses.find(s => s.name === 'В работе')!.id,
        due_date: '2023-08-15',
      },
    ];

    for (const defect of defectsData) {
      const existing = await this.defectsService.findAll();
      if (!existing.find(d => d.title === defect.title)) {
        await this.defectsService.create(defect);
      }
    }

    // Создание отчетов
    const reportsData = [
      {
        project_id: projects[0].id,
        title: 'Отчет по проекту А',
        content: 'Содержимое отчета по проекту А',
        file_path: null,
        generated_by: { id: users[0].id } as any,
      },
      {
        project_id: projects[1].id,
        title: 'Отчет по проекту Б',
        content: 'Содержимое отчета по проекту Б',
        file_path: null,
        generated_by: { id: users[1].id } as any,
      },
    ];

    for (const report of reportsData) {
      const existingReports = await this.reportsService['reportsRepository'].find({ where: { title: report.title } });
      if (existingReports.length === 0) {
        await this.reportsService['reportsRepository'].save(report);
      }
    }

    // Создание вложений
    const defects = await this.defectsService.findAll();
    const attachmentsData = [
      {
        defectId: defects[0].id,
        filePath: '/uploads/defect1_file1.png',
        fileName: 'defect1_file1.png',
        fileType: 'image/png',
        uploadedById: users[0].id,
      },
      {
        defectId: defects[1].id,
        filePath: '/uploads/defect2_file1.docx',
        fileName: 'defect2_file1.docx',
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadedById: users[1].id,
      },
    ];

    for (const attachment of attachmentsData) {
      const existingAttachments = await this.attachmentsService['attachmentsRepository'].find({ where: { file_name: attachment.fileName } });
      if (existingAttachments.length === 0) {
        await this.attachmentsService.create(attachment);
      }
    }

    // Создание связей пользователей и проектов (ProjectUser)
    for (const project of projects) {
      for (const user of users) {
        const existingProjectUser = await this.projectsService['projectUserRepository'].findOne({ where: { project_id: project.id, user_id: user.id } });
        if (!existingProjectUser) {
          await this.projectsService['projectUserRepository'].save({
            project_id: project.id,
            user_id: user.id,
            has_access: true,
          });
        }
      }
    }
  }
}
