import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { REDIS_CLIENT_TOKEN } from './redis.constants';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject(REDIS_CLIENT_TOKEN) private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  get client(): Redis {
    return this.redis;
  }

  get defaultTtl(): number {
    return this.configService.get<number>('redis.ttlSeconds', 300);
  }

  async get<T>(key: string): Promise<T | null> {
    const payload = await this.redis.get(key);
    return payload ? (JSON.parse(payload) as T) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const payload = JSON.stringify(value);
    await this.redis.set(key, payload, 'EX', ttlSeconds ?? this.defaultTtl);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
