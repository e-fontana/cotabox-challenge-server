import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { env } from './utils/env-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupGlobals(app);
  setupSwagger(app);

  await app.listen(env.PORT);
}

bootstrap()
  .then(() => {
    console.log(
      `🤖 [PROJETO FINAL]: Servidor rodando em: http://localhost:${env.PORT}`,
    );
  })
  .catch((error) => {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  });

function setupGlobals(app: INestApplication) {
  const reflector = app.get(Reflector);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));
}

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Cotabox Fullstack Challenge - API')
    .setDescription('API documentation for the Cotabox Fullstack Challenge')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentation = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, documentation);
}
