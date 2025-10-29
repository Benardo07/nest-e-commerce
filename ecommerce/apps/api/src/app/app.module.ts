import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'node:path';
import { redisStore } from 'cache-manager-ioredis-yet';
import { SharedModule } from '@ecommerce/shared';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    SharedModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  translateTime: 'SYS:standard',
                },
              }
            : undefined,
        level: process.env.LOG_LEVEL ?? 'info',
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const ttlSecondsRaw = configService.get<number>('redis.ttlSeconds');
        const ttl =
          typeof ttlSecondsRaw === 'number' && Number.isFinite(ttlSecondsRaw)
            ? ttlSecondsRaw
            : undefined;

        return {
          store: await redisStore({
            url: configService.getOrThrow<string>('redis.url'),
          }),
          ttl,
        };
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'dist/apps/api/schema.gql'),
      sortSchema: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
    ProductModule,
    OrderModule,
    ChatModule,
  ],
})
export class AppModule {}
