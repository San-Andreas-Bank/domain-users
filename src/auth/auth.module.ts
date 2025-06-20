import { Logger, Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './services/jwt-strategy.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './services/email/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'super_secret_3000'), // Accede a la variable de entorno
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRE_TIME', '7 days'),
          algorithm: 'HS256', // this algorith is by default (char: 255)
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, JwtStrategy, EmailService, Logger],
})
export class AuthModule {}
