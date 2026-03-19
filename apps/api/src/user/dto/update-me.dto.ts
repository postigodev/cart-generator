import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'postigodev' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}
