import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TAuthenticatedUser } from './strategies/jwt-auth.strategy';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn().mockResolvedValue({
      access_token: 'fake-access-token',
      refresh_token: 'fake-refresh-token',
    }),
    register: jest.fn().mockResolvedValue({
      access_token: 'fake-access-token',
      refresh_token: 'fake-refresh-token',
    }),
    logout: jest.fn().mockResolvedValue({
      message: 'User logged out successfully',
    }),
    refreshToken: jest.fn().mockResolvedValue({
      access_token: 'new-fake-access-token',
      refresh_token: 'new-fake-refresh-token',
    }),
    sendForgotPasswordEmail: jest.fn().mockResolvedValue({
      message: 'Password reset email sent successfully',
    }),
    resetPassword: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should login and return tokens', async () => {
    const dto = { username: 'test@example.com', password: 'TIT@Ndapoli2019' };
    const result = await controller.login(dto);
    expect(result).toEqual({
      access_token: 'fake-access-token',
      refresh_token: 'fake-refresh-token',
    });
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
  });

  it('should register and return tokens', async () => {
    const dto = {
      name: 'Test user',
      username: 'test@example.com',
      password: 'TIT@Ndapoli2019',
    };
    const result = await controller.register(dto);
    expect(result).toEqual({
      access_token: 'fake-access-token',
      refresh_token: 'fake-refresh-token',
    });
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });

  it('should logout user', async () => {
    const user: TAuthenticatedUser = { sub: 'user-id', role: 'USER' };
    const result = await controller.logout(user);
    expect(result).toEqual({ message: 'User logged out successfully' });
    expect(mockAuthService.logout).toHaveBeenCalledWith(user.sub);
  });

  it('should refresh token and return new tokens', async () => {
    const refreshTokenDto = { refreshToken: 'some-refresh-token' };
    const result = await controller.refresh(refreshTokenDto);
    expect(result).toEqual({
      access_token: 'new-fake-access-token',
      refresh_token: 'new-fake-refresh-token',
    });
    expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
      refreshTokenDto.refreshToken,
    );
  });

  it('should send forgot password email', async () => {
    const username = 'test@example.com';
    const result = await controller.forgotPassword(username);
    expect(result).toEqual({
      message: 'Password reset email sent successfully',
    });
    expect(mockAuthService.sendForgotPasswordEmail).toHaveBeenCalledWith(
      username,
    );
  });

  it('should reset password', async () => {
    const token = 'reset-token';
    const resetPasswordDto = { password: 'AIAIAIUIUIUI' };
    const result = await controller.resetPassword(token, resetPasswordDto);
    expect(result).toBeUndefined();
    expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
      token,
      resetPasswordDto.password,
    );
  });
});
