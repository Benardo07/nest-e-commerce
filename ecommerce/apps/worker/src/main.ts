import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);

  const clientId =
    configService.get<string>('kafka.clientId') ?? 'ecommerce-worker';
  const brokersValue = configService.get<string[] | string>('kafka.brokers');
  const brokers = Array.isArray(brokersValue)
    ? brokersValue
    : typeof brokersValue === 'string'
    ? brokersValue.split(',').map((broker) => broker.trim()).filter(Boolean)
    : ['localhost:9093'];
  const groupPrefix =
    configService.get<string>('kafka.consumerGroupPrefix') ??
    'ecommerce-consumer';

  const kafkaOptions: MicroserviceOptions = {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: `${clientId}-worker`,
        brokers,
      },
      consumer: {
        groupId: `${groupPrefix}-worker`,
      },
    },
  };

  app.connectMicroservice(kafkaOptions);

  await app.startAllMicroservices();
  await app.init();

  Logger.log('Worker service connected to Kafka order_events stream');
}

bootstrap();

