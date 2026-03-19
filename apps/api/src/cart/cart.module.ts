import { Module } from '@nestjs/common';
import { AggregationModule } from '../aggregation/aggregation.module';
import { MatchingModule } from '../matching/matching.module';
import { RecipeModule } from '../recipe/recipe.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [RecipeModule, AggregationModule, MatchingModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
