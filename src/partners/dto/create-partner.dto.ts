import { IsNotEmpty, IsPositive, IsString, Max } from 'class-validator';

export class CreatePartnerDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @Max(100)
  @IsPositive()
  @IsNotEmpty()
  participationPercentage: number;
}
