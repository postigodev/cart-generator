import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import type { Retailer } from '@cart/shared';

class GenerateCartSelectionDto {
  @IsString()
  recipe_id!: string;

  @IsIn(['base', 'variant'])
  recipe_type!: 'base' | 'variant';

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  servings_override?: number;
}

export class GenerateCartDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GenerateCartSelectionDto)
  selections!: GenerateCartSelectionDto[];

  @IsIn(['walmart'])
  retailer!: Retailer;
}
