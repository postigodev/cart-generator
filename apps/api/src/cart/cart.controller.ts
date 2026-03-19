import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import type { GenerateCartResponse } from '@cart/shared';
import { CreateCartDraftDto } from './dto/create-cart-draft.dto';
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

  @Post('drafts')
  createDraft(
    @Body() input: CreateCartDraftDto,
    @Headers('x-user-id') actorUserId?: string,
  ) {
    return this.cartService.createDraft(input, actorUserId);
  }

  @Get('drafts')
  listDrafts(@Headers('x-user-id') actorUserId?: string) {
    return this.cartService.listDrafts(actorUserId);
  }

  @Get('drafts/:id')
  findDraft(
    @Param('id') id: string,
    @Headers('x-user-id') actorUserId?: string,
  ) {
    return this.cartService.findDraft(id, actorUserId);
  }

  @Get('generated')
  listGenerated(@Headers('x-user-id') actorUserId?: string) {
    return this.cartService.listGenerated(actorUserId);
  }

  @Get('generated/history')
  listGeneratedHistory(@Headers('x-user-id') actorUserId?: string) {
    return this.cartService.listGeneratedHistory(actorUserId);
  }

  @Get('generated/:id')
  findGenerated(
    @Param('id') id: string,
    @Headers('x-user-id') actorUserId?: string,
  ) {
    return this.cartService.findGenerated(id, actorUserId);
  }
}
