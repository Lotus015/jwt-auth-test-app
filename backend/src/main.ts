import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // Enable cookie parser for JWT refresh tokens
  app.use(cookieParser());

  await app.listen(3000);
  console.log('Backend running on http://localhost:3000');
}

bootstrap();
