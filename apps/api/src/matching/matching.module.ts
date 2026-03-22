import { Module } from '@nestjs/common';
import { KrogerRetailerProductProvider } from './kroger-retailer-product.provider';
import { MockRetailerProductProvider } from './mock-retailer-product.provider';
import { MatchingService } from './matching.service';
import { WalmartRetailerProductProvider } from './walmart-retailer-product.provider';

@Module({
  providers: [
    MatchingService,
    MockRetailerProductProvider,
    KrogerRetailerProductProvider,
    WalmartRetailerProductProvider,
  ],
  exports: [MatchingService],
})
export class MatchingModule {}
