import { Body, Controller, Headers, Post } from '@nestjs/common';
import type { GenerateCartResponse } from '@cart/shared';
import { GenerateCartDto } from './dto/generate-cart.dto';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('generate')
  generate(
    @Body() input: GenerateCartDto,
    @Headers('x-user-id') actorUserId?: string,
  ): Promise<GenerateCartResponse> {
    return this.cartService.generate(input, actorUserId);
  }
}
