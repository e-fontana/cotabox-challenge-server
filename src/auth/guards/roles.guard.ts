// src/common/guards/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { ROLES_KEY } from 'src/common/decorators/role.decorator';
import { TAuthenticatedUser } from '../strategies/jwt-auth.strategy';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const UserRoleLevel = {
      ADMIN: 99,
      USER: 50,
    } as const;

    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    let requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) requiredRoles = [UserRole.ADMIN];

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as TAuthenticatedUser | undefined;

    if (!user) {
      throw new ForbiddenException('Unauthorized access');
    }

    const requiredLevel = Math.max(
      ...requiredRoles.map((role) => UserRoleLevel[role]),
    );

    const userLevel = UserRoleLevel[user.role];

    if (userLevel < requiredLevel) {
      throw new ForbiddenException('Unauthorized access');
    }

    return true;
  }
}
