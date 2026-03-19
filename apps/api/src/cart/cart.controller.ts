import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { RequestActorGuard } from '../auth/request-actor.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  ApiCartController,
  ApiCreateCart,
  ApiCreateCartDraft,
  ApiCreateShoppingCart,
  ApiDeleteCart,
  ApiDeleteCartDraft,
  ApiGetCart,
  ApiGetCartDraft,
  ApiGetShoppingCart,
  ApiListCartDrafts,
  ApiListCarts,
  ApiListShoppingCartHistory,
  ApiListShoppingCarts,
  ApiUpdateCart,
  ApiUpdateCartDraft,
} from './cart.swagger';
import { CartService } from './cart.service';
import { CreateCartDraftDto } from './dto/create-cart-draft.dto';
import { CreateCartDto } from './dto/create-cart.dto';
import { CreateShoppingCartDto } from './dto/create-shopping-cart.dto';
import { UpdateCartDraftDto } from './dto/update-cart-draft.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('api/v1')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('cart-drafts')
  @UseGuards(RequestActorGuard)
  @ApiCartController('cart-drafts')
  @ApiCreateCartDraft()
  createDraft(
    @Body() input: CreateCartDraftDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cartService.createDraft(input, user.sub);
  }

  @Patch('cart-drafts/:id')
  @UseGuards(RequestActorGuard)
  @ApiCartController('cart-drafts')
  @ApiUpdateCartDraft()
  updateDraft(
    @Param('id') id: string,
    @Body() input: UpdateCartDraftDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cartService.updateDraft(id, input, user.sub);
  }

  @Delete('cart-drafts/:id')
  @UseGuards(RequestActorGuard)
  @HttpCode(204)
  @ApiCartController('cart-drafts')
  @ApiDeleteCartDraft()
  async removeDraft(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.cartService.removeDraft(id, user.sub);
  }

  @Get('cart-drafts')
  @UseGuards(RequestActorGuard)
  @ApiCartController('cart-drafts')
  @ApiListCartDrafts()
  listDrafts(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.listDrafts(user.sub);
  }

  @Get('cart-drafts/:id')
  @UseGuards(RequestActorGuard)
  @ApiCartController('cart-drafts')
  @ApiGetCartDraft()
  findDraft(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cartService.findDraft(id, user.sub);
  }

  @Post('carts')
  @UseGuards(RequestActorGuard)
  @ApiCartController('carts')
  @ApiCreateCart()
  createCart(
    @Body() input: CreateCartDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cartService.createCart(input, user.sub);
  }

  @Patch('carts/:id')
  @UseGuards(RequestActorGuard)
  @ApiCartController('carts')
  @ApiUpdateCart()
  updateCart(
    @Param('id') id: string,
    @Body() input: UpdateCartDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cartService.updateCart(id, input, user.sub);
  }

  @Delete('carts/:id')
  @UseGuards(RequestActorGuard)
  @HttpCode(204)
  @ApiCartController('carts')
  @ApiDeleteCart()
  async removeCart(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.cartService.removeCart(id, user.sub);
  }

  @Get('carts')
  @UseGuards(RequestActorGuard)
  @ApiCartController('carts')
  @ApiListCarts()
  listCarts(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.listCarts(user.sub);
  }

  @Get('carts/:id')
  @UseGuards(RequestActorGuard)
  @ApiCartController('carts')
  @ApiGetCart()
  findCart(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cartService.findCart(id, user.sub);
  }

  @Post('carts/:cartId/shopping-carts')
  @UseGuards(RequestActorGuard)
  @ApiCartController('shopping-carts')
  @ApiCreateShoppingCart()
  createShoppingCart(
    @Param('cartId') cartId: string,
    @Body() input: CreateShoppingCartDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cartService.createShoppingCart(cartId, input, user.sub);
  }

  @Get('shopping-carts/history')
  @UseGuards(RequestActorGuard)
  @ApiCartController('shopping-carts')
  @ApiListShoppingCartHistory()
  listShoppingCartHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.listShoppingCartHistory(user.sub);
  }

  @Get('shopping-carts')
  @UseGuards(RequestActorGuard)
  @ApiCartController('shopping-carts')
  @ApiListShoppingCarts()
  listShoppingCarts(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.listShoppingCarts(user.sub);
  }

  @Get('shopping-carts/:id')
  @UseGuards(RequestActorGuard)
  @ApiCartController('shopping-carts')
  @ApiGetShoppingCart()
  findShoppingCart(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cartService.findShoppingCart(id, user.sub);
  }
}
