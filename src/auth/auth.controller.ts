import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/role.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthRegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TAuthenticatedUser } from './strategies/jwt-auth.strategy';

@ApiTags('Autenticação')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/register')
  register(@Body() createAuthDto: AuthRegisterDto) {
    return this.authService.register(createAuthDto);
  }

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(UserLoginDto)
  @ApiOperation({ summary: 'Login user and return access and refresh tokens' })
  async login(@Body() loginDto: UserLoginDto) {
    const { access_token, refresh_token } =
      await this.authService.login(loginDto);

    return {
      access_token,
      refresh_token,
    };
  }

  @Roles('USER')
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @UsePipes(RefreshTokenDto)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Logout user and invalidate refresh token' })
  logout(@User() user: TAuthenticatedUser) {
    return this.authService.logout(user.sub);
  }

  @Public()
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  @UsePipes(RefreshTokenDto)
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Public()
  @Post('/forgot-password/:username')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Param('username') username: string) {
    return this.authService.sendForgotPasswordEmail(username);
  }

  @Public()
  @Post('/reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(
    @Query('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(token, resetPasswordDto.password);
  }
}
