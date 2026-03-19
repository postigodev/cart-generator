import { Module } from '@nestjs/common';
import { UserContextService } from './user-context.service';

@Module({
  providers: [UserContextService],
  exports: [UserContextService],
})
export class UserModule {}
