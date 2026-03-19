import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateMeDto } from './dto/update-me.dto';

export const ApiMeController = () => applyDecorators(ApiTags('me'));

export const ApiGetMe = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get the current authenticated user profile' }),
    ApiOkResponse({ description: 'Returns the authenticated user profile.' }),
  );

export const ApiUpdateMe = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update the current authenticated user profile' }),
    ApiBody({ type: UpdateMeDto }),
    ApiOkResponse({ description: 'Returns the updated user profile.' }),
  );
