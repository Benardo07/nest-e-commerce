import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaProducerService } from './kafka.producer';
import { KAFKA_CLIENT_TOKEN } from './kafka.constants';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: KAFKA_CLIENT_TOKEN,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: configService.get<string>('kafka.clientId'),
              brokers: configService.get<string[]>('kafka.brokers'),
            },
            consumer: {
              groupId: `${configService.get<string>(
                'kafka.consumerGroupPrefix',
              )}-${process.pid}`,
            },
          },
        }),
      },
    ]),
  ],
  providers: [KafkaProducerService],
  exports: [KafkaProducerService, ClientsModule],
})
export class KafkaModule {}
