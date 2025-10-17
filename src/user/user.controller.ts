import { Body, Controller, Get, Put, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TAuthenticatedUser } from 'src/auth/strategies/jwt-auth.strategy';
import { Roles } from 'src/common/decorators/role.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('users')
@Roles('USER')
@ApiBearerAuth('access_token')
@ApiTags('Usuários')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get('me')
  async getMeById(@User() user: TAuthenticatedUser) {
    return this.service.findWithoutPassword(user.sub);
  }

  @Put('me')
  @UsePipes(UpdateUserDto)
  async updateMe(
    @User() user: TAuthenticatedUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.service.update(user.sub, updateUserDto);
  }
}
