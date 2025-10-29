import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@ecommerce/shared';
import type { Notification, Prisma } from '@prisma/client';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async notify(
    recipientId: string,
    type: string,
    payload: Prisma.InputJsonValue,
    orderId?: string,
  ): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: {
        recipientId,
        orderId,
        type,
        payload,
      },
    });

    this.logger.log(
      `Queued notification ${notification.id} for user ${recipientId}: ${type}`,
    );
    return notification;
  }
}
