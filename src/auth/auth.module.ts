import { Module } from '@nestjs/common';
import { MailModule } from 'src/common/mail/mail.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt-auth.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [UserModule, PrismaModule, MailModule],
})
export class AuthModule {}
