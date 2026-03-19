import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ApiGetMe, ApiMeController, ApiUpdateMe } from './user.swagger';
import { UpdateMeDto } from './dto/update-me.dto';
import { MeService } from './me.service';

@ApiMeController()
@Controller('api/v1/me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  @ApiGetMe()
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.meService.getProfile(user.sub);
  }

  @Patch()
  @ApiUpdateMe()
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: UpdateMeDto,
  ) {
    return this.meService.updateProfile(user.sub, input);
  }
}
