import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';
import * as dotenv from 'dotenv';
import 'reflect-metadata'; // necessário para class-validator funcionar

dotenv.config();

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_ISSUER: string;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  MAIL_HOST: string;

  @IsNumber()
  MAIL_PORT: number;

  @IsString()
  MAIL_USER: string;

  @IsString()
  MAIL_PASSWORD: string;
}

const envVars = plainToInstance(EnvironmentVariables, {
  NODE_ENV: process.env.NODE_ENV,
  PORT: Number(process.env.PORT),
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ISSUER: process.env.JWT_ISSUER || 'auth-service',
  DATABASE_URL: process.env.DATABASE_URL,

  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: Number(process.env.MAIL_PORT),
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD,
});

const errors = validateSync(envVars, {
  skipMissingProperties: false,
});

if (errors.length > 0) {
  console.error('❌ Erro nas variáveis de ambiente:', errors);
  process.exit(1);
}

export const env = envVars;
