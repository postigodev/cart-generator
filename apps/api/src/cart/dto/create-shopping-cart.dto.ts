import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { Retailer } from '@cart/shared';

export class CreateShoppingCartDto {
  @ApiProperty({ enum: ['walmart', 'kroger'] })
  @IsIn(['walmart', 'kroger'])
  retailer!: Retailer;
}
