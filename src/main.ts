import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'https://front-streamverse.vercel.app', // 🔥 Producción
    'http://localhost:4000', // 🔥 Desarrollo local
    'http://3.88.7.20:4000', // 🔥 Frontend en EC2
    'http://192.168.100.92:4000',
    'http://54.157.182.4:4000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      console.log('origin: ', origin);
      if (!origin || allowedOrigins.includes(origin)) {
        console.log(`✅ CORS permitido para: ${origin}`);
        callback(null, true);
      } else {
        console.error(`❌ CORS bloqueado para: ${origin}`);
        callback(new Error('CORS bloqueado'), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    credentials: true,
    optionsSuccessStatus: 204,
  });

    // Esto ayuda a prevenir sobrecargas y ataques DDoS.
    app.use(
      rateLimit({
        windowMs: 60 * 1000, // Ventana de 1 minuto
        max: 5, // Máximo 5 peticiones por IP en la ventana de 1 minuto
        message: 'Has excedido el límite de solicitudes. Intenta de nuevo más tarde.',
        headers: true, // Incluye cabeceras con información sobre los límites
      }),
    );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.APP_PORT ?? 3000;
  await app.listen(port, () => {
    console.log(`✅ Server running on ==> http://0.0.0.0:${port}`);
  });
}

bootstrap();
