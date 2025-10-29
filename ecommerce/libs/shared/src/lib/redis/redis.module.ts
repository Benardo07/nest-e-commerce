import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from './redis.provider';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: createClient.token,
      inject: [ConfigService],
      useFactory: createClient.factory,
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
