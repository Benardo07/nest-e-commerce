import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import type { AppConfig } from '@ecommerce/shared/lib/config/types';
import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService<AppConfig>);

  const kafkaOptions: MicroserviceOptions = {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: `${configService.get<string>('kafka.clientId')}-worker`,
        brokers: configService.get<string[]>('kafka.brokers'),
      },
      consumer: {
        groupId: `${configService.get<string>(
          'kafka.consumerGroupPrefix',
        )}-worker`,
      },
    },
  };

  app.connectMicroservice(kafkaOptions);

  await app.startAllMicroservices();
  await app.init();

  Logger.log('Worker service connected to Kafka order_events stream');
}

bootstrap();
