import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { MailService } from 'src/common/mail/mail.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  const mockUserService = {
    create: jest.fn(),
    findByUsername: jest.fn(),
    findById: jest.fn(),
    updatePassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    signAsync: jest.fn(),
    verify: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockPrismaService = {
    refreshToken: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockMailService = {
    sendPasswordResetEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should hash password and create user', async () => {
      const dto = {
        username: 'test@example.com',
        name: 'Test User',
        password: '123456',
      };

      mockUserService.create.mockResolvedValue({ id: 'user-id' });

      const result = await authService.register(dto);

      expect(mockUserService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: dto.username,
          name: dto.name,
        }),
      );
      expect(result).toEqual({ id: 'user-id' });
    });

    it('should throw BadRequestException if user already exists', async () => {
      mockUserService.create.mockRejectedValue(
        new BadRequestException('User already exists'),
      );

      const dto = {
        username: 'test@example.com',
        name: 'Test User',
        password: '123456',
      };

      await expect(mockUserService.create(dto)).rejects.toThrow(
        'User already exists',
      );
    });

    describe('login', () => {
      it('should throw if user is not found', async () => {
        mockUserService.findByUsername.mockResolvedValue(null);

        await expect(
          authService.login({ username: 'x', password: 'x' }),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw if password is invalid', async () => {
        mockUserService.findByUsername.mockResolvedValue({ password: 'hashed' });
        jest.spyOn(argon2, 'verify').mockResolvedValue(false);

        await expect(
          authService.login({ username: 'x', password: 'wrong' }),
        ).rejects.toThrow(BadRequestException);
      });

      it('should return access and refresh tokens', async () => {
        mockUserService.findByUsername.mockResolvedValue({
          id: 'user-id',
          password: 'hashed',
          role: UserRole.USER,
        });
        jest.spyOn(argon2, 'verify').mockResolvedValue(true);
        mockJwtService.signAsync.mockResolvedValue('access-token');
        jest
          .spyOn(argon2, 'hash')
          .mockResolvedValue('$argon2id$hashed-refresh');
        mockPrismaService.refreshToken.create.mockResolvedValue({});

        const result = await authService.login({
          username: 'x',
          password: '123456',
        });

        expect(result).toEqual({
          access_token: 'access-token',
          refresh_token: 'access-token',
        });
      });
    });

    describe('logout', () => {
      it('should delete all refresh tokens for user', async () => {
        mockPrismaService.refreshToken.deleteMany.mockResolvedValue({});

        const result = await authService.logout('user-id');

        expect(mockPrismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
          where: { userId: 'user-id' },
        });

        expect(result).toEqual({
          message: 'User logged out successfully',
        });
      });
    });

    describe('sendForgotPasswordEmail', () => {
      it('should throw if user not found', async () => {
        mockUserService.findByUsername.mockResolvedValue(null);

        await expect(
          authService.sendForgotPasswordEmail('test@example.com'),
        ).rejects.toThrow(BadRequestException);
      });

      it('should send reset email if user is found', async () => {
        mockUserService.findByUsername.mockResolvedValue({ id: 'user-id' });
        mockJwtService.sign.mockReturnValue('jwt-token');

        const result =
          await authService.sendForgotPasswordEmail('test@example.com');

        expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledWith(
          'test@example.com',
          'jwt-token',
        );
        expect(result).toEqual({
          message: 'Password reset email sent successfully',
        });
      });
    });
  });
});
