import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PostgresModule } from './common/postgres.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    PostgresModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
