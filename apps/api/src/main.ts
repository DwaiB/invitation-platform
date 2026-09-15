import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Global API prefix — all routes under /api/v1
  app.setGlobalPrefix('api/v1');

  // CORS — allow Next.js frontend origins
  app.enableCors({
    origin: [
      'http://localhost:3000',
      ...(process.env.ALLOWED_ORIGINS?.split(',') ?? []),
    ],
    credentials: true,
  });

  // Global exception filter — standardized { success: false, error: { code, message } }
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response transformer — wraps all data in { success: true, data }
  app.useGlobalInterceptors(new TransformInterceptor());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3001;

  await app.listen(port);
  logger.log(`🚀 API running at http://localhost:${port}/api/v1`);
  logger.log(`❤️  Health: http://localhost:${port}/api/v1/health`);
}

await bootstrap();
