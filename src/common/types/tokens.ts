import { UserRole } from '@prisma/client';

export type TAccessTokenPayload = {
  sub: string;
  role: UserRole;
  iss: 'auth-service';
  iat: number;
  exp: number;
};

export type TRefreshTokenPayload = {
  sub: string;
  jti: string;
};
