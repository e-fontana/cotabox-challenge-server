import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './common/mail/mail.module';
import { UserModule } from './user/user.module';
import { env } from './utils/env-validator';
import { PartnersModule } from './partners/partners.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    JwtModule.register({
      global: true,
      secret: env.JWT_SECRET,
    }),
    MailModule,
    PartnersModule,
  ],
})
export class AppModule {}
