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
import type { BaseRecipe } from '@cart/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import {
  OptionalRequestActorGuard,
  RequestActorGuard,
} from '../auth/request-actor.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  ApiCreateRecipe,
  ApiDeleteRecipe,
  ApiGetRecipe,
  ApiGetRecipeOrigin,
  ApiListRecipes,
  ApiRecipeController,
  ApiUpdateRecipe,
} from './recipe.swagger';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeService } from './recipe.service';

@ApiRecipeController()
@Controller('api/v1/recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  @UseGuards(RequestActorGuard)
  @ApiCreateRecipe()
  create(
    @Body() input: CreateRecipeDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BaseRecipe> {
    return this.recipeService.create(input, user.sub);
  }

  @Get()
  @UseGuards(OptionalRequestActorGuard)
  @ApiListRecipes()
  findAll(@CurrentUser() user?: AuthenticatedUser): Promise<BaseRecipe[]> {
    return this.recipeService.findAll(user?.sub);
  }

  @Get(':id/origin')
  @UseGuards(OptionalRequestActorGuard)
  @ApiGetRecipeOrigin()
  findOrigin(
    @Param('id') id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<BaseRecipe> {
    return this.recipeService.findOrigin(id, user?.sub);
  }

  @Get(':id')
  @UseGuards(OptionalRequestActorGuard)
  @ApiGetRecipe()
  findOne(
    @Param('id') id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<BaseRecipe> {
    return this.recipeService.findOne(id, user?.sub);
  }

  @Patch(':id')
  @UseGuards(RequestActorGuard)
  @ApiUpdateRecipe()
  update(
    @Param('id') id: string,
    @Body() input: UpdateRecipeDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BaseRecipe> {
    return this.recipeService.update(id, input, user.sub);
  }

  @Delete(':id')
  @UseGuards(RequestActorGuard)
  @HttpCode(204)
  @ApiDeleteRecipe()
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.recipeService.remove(id, user.sub);
  }
}
