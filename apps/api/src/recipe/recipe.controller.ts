import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import type { BaseRecipe } from '@cart/shared';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeService } from './recipe.service';

@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  create(
    @Body() input: CreateRecipeDto,
    @Headers('x-user-id') actorUserId?: string,
  ): Promise<BaseRecipe> {
    return this.recipeService.create(input, actorUserId);
  }

  @Get()
  findAll(@Headers('x-user-id') actorUserId?: string): Promise<BaseRecipe[]> {
    return this.recipeService.findAll(actorUserId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('x-user-id') actorUserId?: string,
  ): Promise<BaseRecipe> {
    return this.recipeService.findOne(id, actorUserId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() input: UpdateRecipeDto,
    @Headers('x-user-id') actorUserId?: string,
  ): Promise<BaseRecipe> {
    return this.recipeService.update(id, input, actorUserId);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Param('id') id: string,
    @Headers('x-user-id') actorUserId?: string,
  ): Promise<void> {
    await this.recipeService.remove(id, actorUserId);
  }
}
