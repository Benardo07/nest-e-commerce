import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext } from '@nestjs/microservices';
import { PrismaService } from '@ecommerce/shared';
import type { OrderEventEnvelope, OrderEventType } from '@ecommerce/contracts';
import { NotificationService } from './notification.service';

@Controller()
export class OrderEventsConsumer {
  private readonly logger = new Logger(OrderEventsConsumer.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  @EventPattern('order_events')
  async handleOrderEvent(@Ctx() context: KafkaContext) {
    const payload = this.parseEvent(context);
    if (!payload) {
      return;
    }

    this.logger.debug(
      `Processing event ${payload.eventType} for order ${payload.orderId}`,
    );

    switch (payload.eventType) {
      case 'order_placed':
        await this.onOrderPlaced(
          payload as OrderEventEnvelope<'order_placed'>,
        );
        break;
      case 'order_confirmed':
        await this.onOrderConfirmed(
          payload as OrderEventEnvelope<'order_confirmed'>,
        );
        break;
      case 'order_shipped':
        await this.onOrderShipped(
          payload as OrderEventEnvelope<'order_shipped'>,
        );
        break;
      case 'order_completed':
        await this.onOrderCompleted(
          payload as OrderEventEnvelope<'order_completed'>,
        );
        break;
      default:
        this.logger.warn(`Unhandled order event ${payload.eventType}`);
    }
  }

  private parseEvent(context: KafkaContext): OrderEventEnvelope | null {
    const message = context.getMessage();
    const value = message.value?.toString();
    if (!value) {
      this.logger.warn('Received empty Kafka message');
      return null;
    }

    try {
      return JSON.parse(value) as OrderEventEnvelope;
    } catch (error) {
      this.logger.error('Failed to parse order event', error as Error);
      return null;
    }
  }

  private async onOrderPlaced(event: OrderEventEnvelope<'order_placed'>) {
    await this.notifications.notify(event.payload.sellerId, 'order_placed', {
      orderId: event.orderId,
      buyerId: event.payload.buyerId,
      productId: event.payload.productId,
    });
  }

  private async onOrderConfirmed(
    event: OrderEventEnvelope<'order_confirmed'>,
  ) {
    await this.notifications.notify(event.payload.buyerId, 'order_confirmed', {
      orderId: event.orderId,
      sellerId: event.payload.sellerId,
    });
  }

  private async onOrderShipped(event: OrderEventEnvelope<'order_shipped'>) {
    await this.notifications.notify(event.payload.buyerId, 'order_shipped', {
      orderId: event.orderId,
      trackingId: event.payload.trackingId,
    });
  }

  private async onOrderCompleted(
    event: OrderEventEnvelope<'order_completed'>,
  ) {
    await this.notifications.notify(event.payload.sellerId, 'order_completed', {
      orderId: event.orderId,
      buyerId: event.payload.buyerId,
    });
  }
}
