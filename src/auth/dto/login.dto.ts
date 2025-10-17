import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserLoginDto {
  @ApiProperty({
    example: 'contato@cotabox.com.br',
  })
  @IsEmail({}, { message: 'Username must be a valid e-mail' })
  username: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'C0t@box2025!',
  })
  password: string;
}
