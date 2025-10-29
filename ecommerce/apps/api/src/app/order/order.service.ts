import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@ecommerce/shared';
import { KafkaProducerService } from '@ecommerce/shared/lib/kafka/kafka.producer';
import {
  ORDER_EVENT_VERSION,
  OrderEventEnvelope,
} from '@ecommerce/contracts';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { ShipOrderDto } from './dto/ship-order.dto';
import { OrderModel } from './models/order.model';
import { OrderRole } from './models/order-role.enum';
import { OrderConnection } from './models/order-connection.model';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async placeOrder(buyerId: string, dto: CreateOrderDto): Promise<OrderModel> {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      select: { id: true, sellerId: true, isArchived: true },
    });

    if (!product || product.isArchived) {
      throw new NotFoundException('Product not available');
    }

    if (product.sellerId === buyerId) {
      throw new BadRequestException('You cannot purchase your own product');
    }

    const orderId = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          buyerId,
          sellerId: product.sellerId,
          productId: product.id,
          status: OrderStatus.PENDING,
        },
      });

      await tx.orderTimelineEntry.create({
        data: {
          orderId: created.id,
          status: OrderStatus.PENDING,
          detail: { message: 'Order placed' },
        },
      });

      return created.id;
    });

    await this.emitOrderEvent('order_placed', {
      orderId,
      buyerId,
      sellerId: product.sellerId,
      productId: product.id,
    });

    return this.getOrderById(orderId);
  }

  async confirmOrder(orderId: string, sellerId: string): Promise<OrderModel> {
    const order = await this.getOrderEntity(orderId);
    if (order.sellerId !== sellerId) {
      throw new ForbiddenException('Only the seller can confirm this order');
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be confirmed');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CONFIRMED },
      });
      await tx.orderTimelineEntry.create({
        data: {
          orderId,
          status: OrderStatus.CONFIRMED,
          detail: { message: 'Order confirmed' },
        },
      });
    });

    await this.emitOrderEvent('order_confirmed', {
      orderId: order.id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
    });

    return this.getOrderById(orderId);
  }

  async shipOrder(
    orderId: string,
    sellerId: string,
    dto: ShipOrderDto,
  ): Promise<OrderModel> {
    const order = await this.getOrderEntity(orderId);
    if (order.sellerId !== sellerId) {
      throw new ForbiddenException('Only the seller can ship this order');
    }
    if (order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('Order must be confirmed before shipping');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.SHIPPED,
          trackingId: dto.trackingId,
        },
      });
      await tx.orderTimelineEntry.create({
        data: {
          orderId,
          status: OrderStatus.SHIPPED,
          detail: { trackingId: dto.trackingId },
        },
      });
    });

    await this.emitOrderEvent('order_shipped', {
      orderId: order.id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      trackingId: dto.trackingId,
    });

    return this.getOrderById(orderId);
  }

  async completeOrder(orderId: string, buyerId: string): Promise<OrderModel> {
    const order = await this.getOrderEntity(orderId);
    if (order.buyerId !== buyerId) {
      throw new ForbiddenException('Only the buyer can complete this order');
    }
    if (order.status !== OrderStatus.SHIPPED) {
      throw new BadRequestException('Order must be shipped before completion');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.COMPLETED },
      });
      await tx.orderTimelineEntry.create({
        data: {
          orderId,
          status: OrderStatus.COMPLETED,
          detail: { message: 'Order completed' },
        },
      });
    });

    await this.emitOrderEvent('order_completed', {
      orderId: order.id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
    });

    return this.getOrderById(orderId);
  }

  async getOrderById(id: string): Promise<OrderModel> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        timeline: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return this.toModel(order);
  }

  async listOrdersForUser(
    userId: string,
    role: OrderRole | string,
    pagination?: PaginationDto,
  ): Promise<OrderConnection> {
    const normalizedRole: OrderRole =
      typeof role === 'string'
        ? role.toLowerCase() === 'buyer'
          ? OrderRole.BUYER
          : OrderRole.SELLER
        : role;

    const { offset = 0, limit = 25 } = pagination ?? {};

    const where: Prisma.OrderWhereInput =
      normalizedRole === OrderRole.BUYER
        ? { buyerId: userId }
        : { sellerId: userId };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          timeline: {
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toModel(item)),
      total,
    };
  }

  private async getOrderEntity(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  private async emitOrderEvent(
    eventType: OrderEventEnvelope['eventType'],
    payload: OrderEventEnvelope['payload'],
  ): Promise<void> {
    await this.kafkaProducer.emitOrderEvent({
      eventType,
      orderId: payload.orderId,
      occurredAt: new Date().toISOString(),
      payload,
      version: ORDER_EVENT_VERSION,
    });
  }

  private toModel(order: Prisma.OrderGetPayload<{
    include: { timeline: true };
  }>): OrderModel {
    return {
      id: order.id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      productId: order.productId,
      status: order.status,
      trackingId: order.trackingId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      timeline: order.timeline.map((entry) => ({
        id: entry.id,
        status: entry.status,
        detail: entry.detail as Record<string, unknown> | null,
        createdAt: entry.createdAt,
      })),
    };
  }
}
