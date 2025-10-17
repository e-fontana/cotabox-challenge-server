import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TAccessTokenPayload } from 'src/common/types/tokens';
import { env } from 'src/utils/env-validator';

export type TAuthenticatedUser = {
  sub: string;
  role: UserRole;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.JWT_SECRET,
      issuer: env.JWT_ISSUER,
    });
  }

  validate(payload: TAccessTokenPayload): TAuthenticatedUser {
    return {
      sub: payload.sub,
      role: payload.role,
    };
  }
}
