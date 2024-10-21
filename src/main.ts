import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // validation dto
  app.useGlobalPipes(new ValidationPipe());
  // use cookie-parser middleware as global
  app.use(cookieParser());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Code-Sync')
    .setDescription('The Code-Sync API description')
    .setVersion('1.0')
    .addTag('main')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      withCredentials: true,
    },
  });
  await app.listen(3000);
}
bootstrap();
