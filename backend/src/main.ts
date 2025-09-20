import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('System Control Defects')
    .setDescription('The system control API description')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('control', 'System control')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();
  await app.listen(process.env.PORT ?? 3001);

  console.log(`Запуск бекенда: http://localhost:${process.env.PORT ?? 3001}`);
  console.log(`Swagger документация по ссылку: http://localhost:${process.env.PORT ?? 3001}/api`);
}
bootstrap();
