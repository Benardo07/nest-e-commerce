import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';
import { REDIS_CLIENT_TOKEN } from './redis.constants';

const configureRedisOptions = (url: string): RedisOptions => {
  const parsed = new URL(url);
  const tls = parsed.protocol === 'rediss:' ? {} : undefined;

  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
    password: parsed.password || undefined,
    db: Number(parsed.pathname.replace('/', '') || 0),
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    tls,
  };
};

export const createClient = {
  token: REDIS_CLIENT_TOKEN,
  factory: (configService: ConfigService) => {
    const redisUrl = configService.getOrThrow<string>('redis.url');
    const options = configureRedisOptions(redisUrl);
    const client = new Redis(redisUrl, options);

    client.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('[Redis] connection error', err);
    });

    return client;
  },
};

export type RedisClient = ReturnType<typeof createClient.factory>;
