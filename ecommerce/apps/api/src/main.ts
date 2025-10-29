import compression from 'compression';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { PrismaService } from '@ecommerce/shared';
import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);

  app.use(helmet());
  app.use(compression());

  const allowedOrigins =
    configService.get<string[]>('app.allowedOrigins') ?? ['*'];

  app.enableCors({
    origin:
      configService.get<string>('app.nodeEnv') === 'production'
        ? allowedOrigins
        : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const globalPrefix = configService.get<string>('app.globalPrefix') ?? 'api';
  app.setGlobalPrefix(globalPrefix);

  prismaService.enableShutdownHooks(app);

  const port = configService.get<number>('app.port') ?? 3000;
  await app.listen(port);
  logger.log(`API running on http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
