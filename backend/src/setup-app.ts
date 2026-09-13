import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters';
import {
  TransformInterceptor,
  LoggingInterceptor,
} from './common/interceptors';
import { API_PREFIX, APP_NAME } from './shared/constants';
import { ApiErrorResponseDto } from './shared/dto';

export function configureApplication(app: INestApplication): void {
  const configService = app.get(ConfigService);
  // Security
  app.use(helmet());

  // CORS
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  const allowedOrigins = corsOrigin
    ? corsOrigin.split(',').map((origin) => origin.trim())
    : ['http://localhost:5173', 'http://localhost:8081'];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global prefix (exclude health endpoints for direct platform/monitoring access)
  app.setGlobalPrefix(API_PREFIX, {
    exclude: ['health', 'health/(.*)', 'api/v1/health'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle(`${APP_NAME} API`)
    .setDescription(`${APP_NAME} – Home Repair & Maintenance Platform API`)
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ApiErrorResponseDto],
  });
  // OpenAPI describes the same global envelope applied at runtime.
  for (const path of Object.values(document.paths)) {
    for (const method of ['get', 'post', 'patch', 'put', 'delete'] as const) {
      const operation = path[method];
      if (!operation) continue;
      for (const [status, response] of Object.entries(operation.responses)) {
        if ('$ref' in response || status === '204') continue;
        const original = response.content?.['application/json']?.schema ?? {};
        response.content = {
          'application/json': {
            schema:
              Number(status) >= 400
                ? { $ref: '#/components/schemas/ApiErrorResponseDto' }
                : {
                    type: 'object',
                    required: ['success', 'statusCode', 'message', 'data'],
                    properties: {
                      success: { type: 'boolean', example: true },
                      statusCode: { type: 'integer', example: Number(status) },
                      message: { type: 'string', example: 'Success' },
                      data: original,
                      meta: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          total: { type: 'integer' },
                          totalPages: { type: 'integer' },
                        },
                      },
                    },
                  },
          },
        };
      }
    }
  }
  SwaggerModule.setup('api/docs', app, document);
}
