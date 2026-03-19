import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({ example: 'google-id-token' })
  @IsString()
  @MinLength(10)
  id_token!: string;
}
