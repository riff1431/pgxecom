import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  app.set('trust proxy', 'loopback'); // Trust requests from the loopback address
  app.set('etag', false); // Disable ETag generation to prevent 304 Not Modified caching on dynamic settings

  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api');

  // Prevent browser/proxy 304 caching of dynamic JSON APIs
  app.use((req: any, res: any, next: any) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // Global interceptors and filters
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS — hardcoded allowed origins (local dev + production)
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://playgroundfitnex.com',
      'https://www.playgroundfitnex.com',
      'https://api.playgroundfitnex.com',
      'https://playgroundx.vip',
      'https://www.playgroundx.vip'
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('E-commerce API')
    .setDescription('The e-commerce API description')
    .setVersion('1.0')
    .addTag('e-commerce')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'bearer',
    )
    .addSecurityRequirements('bearer')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      deepScanRoutes: true,
    });
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Start the server
  const port = configService.get<number>('PORT') ?? 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend running at http://0.0.0.0:${port}/api`);
}
void bootstrap();
