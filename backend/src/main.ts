import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow frontend (Next.js) to call this API
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Strip unknown fields & validate every request body automatically
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Turn every thrown error into a consistent JSON response
  app.useGlobalFilters(new HttpExceptionFilter());

  // Everything in /uploads is served as a static file (event images)
  app.setGlobalPrefix('api');

  // Swagger docs at /api/docs
  const config = new DocumentBuilder()
    .setTitle('EventX API')
    .setDescription('Event Management Platform - REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`EventX backend running on http://localhost:${port}/api`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
