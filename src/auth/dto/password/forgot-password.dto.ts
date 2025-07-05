import { PickType } from '@nestjs/mapped-types';
import { CreateSignupDto } from '../create-signup.dto';

export class ForgotPasswordDto extends PickType(CreateSignupDto, [
  'email',
] as const) {}
