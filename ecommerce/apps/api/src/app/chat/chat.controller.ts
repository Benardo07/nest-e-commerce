import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { ChatMessagesQueryDto } from './dto/chat-messages-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('threads')
  getThreads(@CurrentUser() user: RequestUser) {
    return this.chatService.getThreadsForUser(user.sub);
  }

  @Get('messages')
  getMessages(
    @CurrentUser() user: RequestUser,
    @Query() query: ChatMessagesQueryDto,
  ) {
    return this.chatService.getMessagesForThread(
      user.sub,
      query.productId,
      query.participantId,
    );
  }
}
