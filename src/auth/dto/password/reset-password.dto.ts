import { PickType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';
import { CreateSignupDto } from '../create-signup.dto';

export class ResetPasswordDto extends PickType(CreateSignupDto, [
  'email',
] as const) {
  @IsOptional()
  @IsString({ message: 'El token debe ser un string' })
  @IsNotEmpty({ message: 'El token es obligatorio si no se usa OTP' })
  token?: string;

  @IsOptional()
  @Matches(/^\d{6}$/, {
    message: 'El código OTP debe ser un número de 6 dígitos',
  })
  otp?: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 20, {
    message: 'The new password must be between 8 and 20 characters long.',
  })
  newPassword: string;
}
