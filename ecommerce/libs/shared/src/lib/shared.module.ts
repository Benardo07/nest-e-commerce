import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { KafkaModule } from './kafka/kafka.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [AppConfigModule, PrismaModule, RedisModule, KafkaModule],
  exports: [AppConfigModule, PrismaModule, RedisModule, KafkaModule],
})
export class SharedModule {}
