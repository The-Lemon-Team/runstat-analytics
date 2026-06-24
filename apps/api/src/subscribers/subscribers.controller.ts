import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import type {
  CreateSubscriberSourceRequest,
  SubscriberHistoryPageDto,
  SubscriberSourceDto,
  UpdateManualSubscriberCountRequest,
} from '@spt/shared'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import {
  CurrentUser,
  type RequestUser,
} from '../auth/decorators/current-user.decorator'
import { SubscribersService } from './subscribers.service'

@Controller('subscribers')
@UseGuards(JwtAuthGuard)
export class SubscribersController {
  constructor(
    @Inject(SubscribersService) private readonly subscribers: SubscribersService,
  ) {}

  @Get('sources')
  findAll(@CurrentUser() user: RequestUser): Promise<SubscriberSourceDto[]> {
    return this.subscribers.findAllForUser(user.id)
  }

  @Post('sources')
  createSource(
    @CurrentUser() user: RequestUser,
    @Body() body: CreateSubscriberSourceRequest,
  ): Promise<SubscriberSourceDto> {
    return this.subscribers.createSource(user.id, body)
  }

  @Delete('sources/:id')
  deleteSource(
    @CurrentUser() user: RequestUser,
    @Param('id') sourceId: string,
  ): Promise<void> {
    return this.subscribers.deleteSource(user.id, sourceId)
  }

  @Post('sync')
  sync(@CurrentUser() user: RequestUser): Promise<SubscriberSourceDto[]> {
    return this.subscribers.syncForUser(user.id)
  }

  @Patch('sources/:id/count')
  updateManualCount(
    @CurrentUser() user: RequestUser,
    @Param('id') sourceId: string,
    @Body() body: UpdateManualSubscriberCountRequest,
  ): Promise<SubscriberSourceDto> {
    return this.subscribers.updateManualCount(user.id, sourceId, body.count)
  }

  @Get('sources/:id/history')
  getHistory(
    @CurrentUser() user: RequestUser,
    @Param('id') sourceId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('filter') filter?: string,
    @Query('publicationId') publicationId?: string,
    @Query('since') since?: string,
  ): Promise<SubscriberHistoryPageDto> {
    const parsedLimit = limit ? Number.parseInt(limit, 10) : undefined
    return this.subscribers.getHistory(
      user.id,
      sourceId,
      cursor,
      Number.isFinite(parsedLimit) ? parsedLimit : undefined,
      filter,
      publicationId,
      since,
    )
  }
}
