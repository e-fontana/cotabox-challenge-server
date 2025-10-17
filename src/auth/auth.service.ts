import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { nanoid } from 'nanoid';
import { MailService } from 'src/common/mail/mail.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { TRefreshTokenPayload } from 'src/common/types/tokens';
import { UserService } from 'src/user/user.service';
import { env } from 'src/utils/env-validator';
import { UserLoginDto } from './dto/login.dto';
import { AuthRegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async register(registerUserDto: AuthRegisterDto) {
    const hashedPassword = await argon2.hash(registerUserDto.password);

    return this.userService.create({
      username: registerUserDto.username,
      name: registerUserDto.name,
      password: hashedPassword,
    });
  }

  async login(loginDto: UserLoginDto) {
    const userData = await this.userService.findByUsername(loginDto.username);

    if (!userData) throw new BadRequestException('Invalid credentials');

    const validatedPassword = await argon2.verify(
      userData.password,
      loginDto.password,
    );

    if (!validatedPassword)
      throw new BadRequestException('Invalid credentials');

    const { accessToken, refreshToken } = await this.generateTokens(
      userData.id,
      userData.role,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async generateTokens(userId: string, role: UserRole = UserRole.USER) {
    const refreshTokenId = nanoid();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          iss: env.JWT_ISSUER,
          sub: userId,
          role,
        },
        { expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        {
          iss: env.JWT_ISSUER,
          jti: refreshTokenId,
          sub: userId,
        },
        { expiresIn: '7d' },
      ),
    ]);

    const hashedRefreshToken = await argon2.hash(refreshToken);

    await this.prismaService.refreshToken.create({
      data: {
        userId,
        id: refreshTokenId,
        token: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string) {
    await this.prismaService.refreshToken.deleteMany({
      where: { userId },
    });

    return {
      message: 'User logged out successfully',
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const tokenPayload =
        await this.jwtService.verifyAsync<TRefreshTokenPayload>(refreshToken, {
          ignoreExpiration: false,
          secret: env.JWT_SECRET,
        });

      const storedToken = await this.prismaService.refreshToken.findUnique({
        where: { userId: tokenPayload.sub, id: tokenPayload.jti },
      });

      if (!storedToken) {
        throw new BadRequestException('Invalid refresh token');
      }

      const isTokenValid = await argon2.verify(storedToken.token, refreshToken);

      if (!isTokenValid) {
        throw new BadRequestException('Invalid refresh token');
      }

      const user = await this.userService.findById(tokenPayload.sub);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await this.generateTokens(user.id, user.role);

      await this.prismaService.refreshToken.delete({
        where: { userId: tokenPayload.sub, id: tokenPayload.jti },
      });

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      };
    } catch {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  async sendForgotPasswordEmail(username: string) {
    const user = await this.userService.findByUsername(username);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const token = this.jwtService.sign(
      { sub: username, iss: 'reset-password' },
      { expiresIn: '5m' },
    );

    await this.mailService.sendPasswordResetEmail(username, token);
    return { message: 'Password reset email sent successfully' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const tokenPayload = await this.jwtService.verify<
        Promise<{ sub: string }>
      >(token, {
        secret: env.JWT_SECRET,
        issuer: 'reset-password',
        ignoreExpiration: false,
      });
      const hashedPassword = await argon2.hash(newPassword);
      await this.userService.updatePassword(tokenPayload.sub, hashedPassword);
    } catch {
      throw new ForbiddenException('Invalid or expired reset password token');
    }
  }
}
