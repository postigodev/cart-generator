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
import type { Tag } from '@cart/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  OptionalRequestActorGuard,
  RequestActorGuard,
} from '../auth/request-actor.guard';
import {
  ApiCreateTag,
  ApiDeleteTag,
  ApiListTags,
  ApiTagsController,
  ApiUpdateTag,
} from './tags.swagger';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagsService } from './tags.service';

@ApiTagsController()
@Controller('api/v1/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @UseGuards(OptionalRequestActorGuard)
  @ApiListTags()
  listTags(@CurrentUser() user?: AuthenticatedUser): Promise<Tag[]> {
    return this.tagsService.listVisible(user?.sub);
  }

  @Post()
  @UseGuards(RequestActorGuard)
  @ApiCreateTag()
  createTag(
    @Body() input: CreateTagDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Tag> {
    return this.tagsService.create(input, user.sub);
  }

  @Patch(':id')
  @UseGuards(RequestActorGuard)
  @ApiUpdateTag()
  updateTag(
    @Param('id') id: string,
    @Body() input: UpdateTagDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Tag> {
    return this.tagsService.update(id, input, user.sub);
  }

  @Delete(':id')
  @UseGuards(RequestActorGuard)
  @HttpCode(204)
  @ApiDeleteTag()
  async deleteTag(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.tagsService.remove(id, user.sub);
  }
}
