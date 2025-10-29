import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { OrderEventEnvelope } from '@ecommerce/contracts';
import { KAFKA_CLIENT_TOKEN, ORDER_EVENTS_TOPIC } from './kafka.constants';

@Injectable()
export class KafkaProducerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaProducerService.name);
  private readonly orderTopic: string;

  constructor(
    @Inject(KAFKA_CLIENT_TOKEN) private readonly client: ClientKafka,
    private readonly configService: ConfigService,
  ) {
    this.orderTopic =
      this.configService.get<string>('kafka.orderEventsTopic') ??
      ORDER_EVENTS_TOPIC;
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  async emitOrderEvent(event: OrderEventEnvelope): Promise<void> {
    this.logger.debug(
      `Publishing order event ${event.eventType} for order ${event.orderId}`,
    );
    await lastValueFrom(
      this.client.emit(this.orderTopic, {
        key: event.orderId,
        value: JSON.stringify(event),
      }),
    );
  }
}
