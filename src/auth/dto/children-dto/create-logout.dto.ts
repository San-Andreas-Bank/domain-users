import { PickType } from '@nestjs/mapped-types';
import { CreateSignupDto } from '../create-signup.dto';

export class CreateLogoutDto extends PickType(CreateSignupDto, [
  'email',
] as const) {}
