import { PickType } from '@nestjs/mapped-types';
import { CreateSignupDto } from '../create-signup.dto';

export class CreateLoginDto extends PickType(CreateSignupDto, [
  'email',
  'password',
  'latitude',
  'longitude',
] as const) {}
