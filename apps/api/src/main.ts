import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global API prefix — all routes under /api/v1
  app.setGlobalPrefix('api/v1');

  // CORS — allow Next.js frontend origins
  const configService = app.get(ConfigService);
  app.enableCors({
    origin: configService.get<string[]>('allowedOrigins', ['http://localhost:3000']),
    credentials: true,
  });

  // Global exception filter — standardized { success: false, error: { code, message } }
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response transformer — wraps all data in { success: true, data }
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = configService.get<number>('port') ?? 3001;

  await app.listen(port);
  logger.log(`🚀 API running at http://localhost:${port}/api/v1`);
  logger.log(`❤️  Health: http://localhost:${port}/api/v1/health`);
}

await bootstrap();
