import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ namespace: '/chat', cors: { origin: true, credentials: true } })
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly chatService: ChatService) {}

  @UseGuards(WsJwtGuard)
  handleConnection(@ConnectedSocket() client: Socket): void {
    const user = client.data.user as JwtPayload | undefined;
    if (!user) {
      client.disconnect();
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_room')
  joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { productId: string; participantId: string },
  ): void {
    const user = client.data.user as JwtPayload;
    const room = this.chatService.buildRoom(
      payload.productId,
      user.sub,
      payload.participantId,
    );
    client.join(room);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_message')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const user = client.data.user as JwtPayload;
    const room = this.chatService.buildRoom(
      dto.productId,
      user.sub,
      dto.receiverId,
    );
    const message = await this.chatService.saveMessage(user.sub, dto);

    const payload = {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      productId: message.productId,
      message: message.message,
      createdAt: message.createdAt,
    };

    this.server.to(room).emit('receive_message', payload);
    return payload;
  }
}
