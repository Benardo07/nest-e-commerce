import * as Joi from 'joi';

export const environmentValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production', 'staging')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  GLOBAL_PREFIX: Joi.string().default('api'),
  APP_ALLOWED_ORIGINS: Joi.string().default('*'),

  DATABASE_URL: Joi.string().uri().required(),

  REDIS_URL: Joi.string().uri().required(),
  REDIS_TTL_SECONDS: Joi.number().integer().min(30).default(300),

  KAFKA_CLIENT_ID: Joi.string().default('ecommerce-api'),
  KAFKA_BROKERS: Joi.string().default('localhost:9092'),
  KAFKA_ORDER_EVENTS_TOPIC: Joi.string().default('order_events'),
  KAFKA_CONSUMER_GROUP_PREFIX: Joi.string().default('ecommerce-consumer'),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_TTL: Joi.string().default('7d'),

  MAIL_FROM: Joi.string().email().default('no-reply@example.com'),
});
