import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../auth/entities/user';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'db'), // ✅ Usa 'db' por alias en docker-compose
        port: parseInt(configService.get<string>('POSTGRES_PORT', '5432'), 10),
        username: configService.get<string>('POSTGRES_USER', 'postgres'),
        password: configService.get<string>('POSTGRES_PASSWORD', 'admin123'),
        database: configService.get<string>('POSTGRES_DB', 'ms_auth'),
        entities: [User],
        synchronize: true, // ❗ Solo para desarrollo
        autoLoadEntities: true, // ✅ Mejora compatibilidad con pruebas
      }),
      inject: [ConfigService],
    }),
  ],
})
export class PostgresModule {}
