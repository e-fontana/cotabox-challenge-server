import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  providers: [UserService],
  exports: [UserService],
  imports: [PrismaModule],
  controllers: [UserController],
})
export class UserModule {}
