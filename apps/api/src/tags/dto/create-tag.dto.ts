import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'Weeknight' })
  @IsString()
  @MinLength(1)
  name!: string;
}
