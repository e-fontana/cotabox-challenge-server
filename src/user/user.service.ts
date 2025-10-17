import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthRegisterDto } from 'src/auth/dto/register.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: AuthRegisterDto) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        username: data.username,
      },
      select: {
        id: true,
      },
    });

    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const createdUser = await this.prismaService.user.create({
      data: {
        username: data.username,
        name: data.name,
        password: data.password,
      },
    });

    return createdUser;
  }

  async findById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findWithoutPassword(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: id },
      omit: {
        password: true,
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByUsername(username: string) {
    const user = await this.prismaService.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, data: UpdateUserDto) {
    const userExists = await this.prismaService.user.findUnique({
      where: { id: id },
    });

    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    return this.prismaService.user.update({
      where: { id: id },
      data: {
        name: data.name,
      },
      omit: {
        password: true,
      },
    });
  }

  async delete(id: string) {
    const userExists = await this.prismaService.user.findUnique({
      where: { id: id },
    });

    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    return this.prismaService.user.delete({
      where: { id: id },
    });
  }

  updatePassword(username: string, newPassword: string) {
    return this.prismaService.user.update({
      where: { username },
      data: {
        password: newPassword,
      },
    });
  }
}
