import { AppConfig } from './types';

export const loadConfiguration = (): AppConfig => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    globalPrefix: process.env.GLOBAL_PREFIX ?? 'api',
    allowedOrigins: (process.env.APP_ALLOWED_ORIGINS ?? '*')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    ttlSeconds: parseInt(process.env.REDIS_TTL_SECONDS ?? '300', 10),
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID ?? 'ecommerce-api',
    brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092')
      .split(',')
      .map((broker) => broker.trim())
      .filter(Boolean),
    orderEventsTopic: process.env.KAFKA_ORDER_EVENTS_TOPIC ?? 'order_events',
    consumerGroupPrefix:
      process.env.KAFKA_CONSUMER_GROUP_PREFIX ?? 'ecommerce-consumer',
  },
  auth: {
    accessTokenTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshTokenTtl: process.env.JWT_REFRESH_TTL ?? '7d',
    accessTokenSecret: process.env.JWT_ACCESS_SECRET ?? '',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET ?? '',
  },
  mail: {
    fromAddress: process.env.MAIL_FROM ?? 'no-reply@example.com',
  },
});
