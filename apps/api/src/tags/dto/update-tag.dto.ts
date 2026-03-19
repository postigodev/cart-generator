import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateTagDto {
  @ApiProperty({ example: 'Weeknight Dinners' })
  @IsString()
  @MinLength(1)
  name!: string;
}
