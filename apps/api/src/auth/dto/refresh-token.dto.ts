import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh-token' })
  @IsString()
  @MinLength(20)
  refresh_token!: string;
}
