import { IsNotEmpty, IsEnum } from 'class-validator';
export enum ResetMethodQuery {
  OTP = 'otp',
  TOKEN = 'token',
}
export class ResetPasswordQueryDto {
  @IsEnum(ResetMethodQuery, { message: 'El método debe ser "otp" o "token"' })
  @IsNotEmpty({ message: 'El método de reseteo es obligatorio' })
  method: ResetMethodQuery;
}
