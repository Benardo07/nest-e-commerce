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
    return `room:${productId}:${sorted[0]}:${sorted[1]}`;
  }

  async getThreadsForUser(userId: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        product: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const threads = new Map<
      string,
      {
        threadId: string;
        productId: string;
        productName: string;
        participantId: string;
        lastMessage?: { message: string; createdAt: Date };
      }
    >();

    for (const message of messages) {
      const participantId =
        message.senderId === userId ? message.receiverId : message.senderId;
      const key = `${message.productId}:${participantId}`;

      if (!threads.has(key)) {
        threads.set(key, {
          threadId: key,
          productId: message.productId,
          productName: message.product?.name ?? 'Unknown product',
          participantId,
          lastMessage: {
            message: message.message,
            createdAt: message.createdAt,
          },
        });
      }
    }

    return Array.from(threads.values());
  }

  async getMessagesForThread(
    userId: string,
    productId: string,
    participantId: string,
  ) {
    return this.prisma.chatMessage.findMany({
      where: {
        productId,
        OR: [
          { senderId: userId, receiverId: participantId },
          { senderId: participantId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
