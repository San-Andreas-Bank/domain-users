import { PickType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { CreateSignupDto } from '../create-signup.dto';

export class ForgotPasswordDto extends PickType(CreateSignupDto, [
  'email',
] as const) {}
