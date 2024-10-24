import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ExceptionGlobalFilter } from './utils/exception-global.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: ['http://localhost:5173'], credentials: true });
  // use cookie-parser middleware as global
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new ExceptionGlobalFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Code-Sync')
    .setDescription('The Code-Sync API description')
    .setVersion('1.0')
    .addTag('main')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/api-document', app, documentFactory, {
    swaggerOptions: {
      withCredentials: true,
    },
  });
  await app.listen(3000);
}
bootstrap();
