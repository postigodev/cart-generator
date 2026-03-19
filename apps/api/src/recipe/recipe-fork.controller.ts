import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { BaseRecipe } from '@cart/shared';
import { ApiProperty } from '@nestjs/swagger';
import type { Response } from 'express';
import { IsString } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import { RequestActorGuard } from '../auth/request-actor.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ApiCreateRecipeFork, ApiRecipeForkController } from './recipe.swagger';
import { RecipeService } from './recipe.service';

class CreateRecipeForkDto {
  @ApiProperty({ example: 'recipe-system-1' })
  @IsString()
  source_recipe_id!: string;
}

@ApiRecipeForkController()
@Controller('api/v1/recipe-forks')
export class RecipeForkController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  @UseGuards(RequestActorGuard)
  @ApiCreateRecipeFork()
  async createFork(
    @Body() input: CreateRecipeForkDto,
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<BaseRecipe> {
    const result = await this.recipeService.save(input.source_recipe_id, user.sub);
    response.status(result.created ? 201 : 200);
    return result.recipe;
  }
}
