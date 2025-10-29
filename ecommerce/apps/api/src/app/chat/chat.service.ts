import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ecommerce/shared';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMessage(senderId: string, dto: SendMessageDto) {
    return this.prisma.chatMessage.create({
      data: {
        senderId,
        receiverId: dto.receiverId,
        productId: dto.productId,
        message: dto.message,
      },
    });
  }

  buildRoom(productId: string, participantA: string, participantB: string): string {
    const sorted = [participantA, participantB].sort();
    return oom:::;
  }
}
