import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import type { Retailer } from '@cart/shared';
import { PartialCartSelectionsDto } from './cart-selection.dto';

export class UpdateCartDto extends PartialCartSelectionsDto {
  @ApiPropertyOptional({ example: 'Updated weekly dinner plan' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ['walmart', 'kroger'] })
  @IsOptional()
  @IsIn(['walmart', 'kroger'])
  retailer?: Retailer;
}
