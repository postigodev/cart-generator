import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateMePreferencesDto {
  @ApiProperty({ example: ['cuisine-peruvian', 'cuisine-mediterranean'] })
  @IsArray()
  @IsString({ each: true })
  preferred_cuisine_ids!: string[];

  @ApiProperty({ example: ['tag-system-weeknight', 'tag-system-comfort-food'] })
  @IsArray()
  @IsString({ each: true })
  preferred_tag_ids!: string[];
}
