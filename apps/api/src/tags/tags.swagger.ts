import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto, TagResponseDto } from '../common/http/swagger.dto';
import {
  badRequestErrorExample,
  dietaryBadgeTagExample,
  systemTagExample,
  userTagExample,
} from '../common/http/swagger.examples';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

export const ApiTagsController = () => applyDecorators(ApiTags('tags'));

export const ApiListTags = () =>
  applyDecorators(
    ApiOperation({ summary: 'List visible tags' }),
    ApiOkResponse({
      description: 'Visible system tags and, when authenticated, the current user tags.',
      type: TagResponseDto,
      isArray: true,
      content: {
        'application/json': {
          examples: {
            visibleTags: {
              summary: 'Visible tags',
              value: [systemTagExample, dietaryBadgeTagExample, userTagExample],
            },
          },
        },
      },
    }),
  );

export const ApiCreateTag = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create a user tag' }),
    ApiBody({ type: CreateTagDto }),
    ApiCreatedResponse({
      description: 'Created user tag',
      type: TagResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Invalid tag payload',
      type: ErrorResponseDto,
      content: {
        'application/json': {
          examples: {
            invalidTagPayload: {
              summary: 'Validation error',
              value: badRequestErrorExample,
            },
          },
        },
      },
    }),
    ApiConflictResponse({
      description: 'Tag slug already exists',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication required',
      type: ErrorResponseDto,
    }),
  );

export const ApiUpdateTag = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update one of your user tags' }),
    ApiBody({ type: UpdateTagDto }),
    ApiOkResponse({
      description: 'Updated user tag',
      type: TagResponseDto,
    }),
    ApiConflictResponse({
      description: 'Tag slug already exists',
      type: ErrorResponseDto,
    }),
    ApiForbiddenResponse({
      description: 'Only your own user tags can be edited',
      type: ErrorResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Tag not found',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication required',
      type: ErrorResponseDto,
    }),
  );

export const ApiDeleteTag = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete one of your user tags' }),
    ApiNoContentResponse({ description: 'Tag deleted' }),
    ApiForbiddenResponse({
      description: 'Only your own user tags can be deleted',
      type: ErrorResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Tag not found',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication required',
      type: ErrorResponseDto,
    }),
  );
