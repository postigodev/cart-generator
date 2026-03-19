import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'postigodev' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 's3cure-passphrase' })
  @IsString()
  @MinLength(8)
  password!: string;
}
