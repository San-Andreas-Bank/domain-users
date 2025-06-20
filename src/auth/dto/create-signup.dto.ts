import {
  IsString,
  IsEmail,
  IsNotEmpty,
  Length,
  IsOptional,
  IsLatitude,
  IsLongitude,
  ValidateIf,
} from 'class-validator';
import { IsDateFormat } from 'src/common/decorators/dates/is-date-format.decorator';
import { TransformDate } from 'src/common/decorators/dates/transform-date.decorator';
import { IsPasswordMatch } from 'src/common/decorators/is-password-match.decorator';

export class CreateSignupDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50, {
    message: 'The name must be between 2 and 50 characters long.',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50, {
    message: 'The last name must be between 2 and 50 characters long.',
  })
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 15, {
    message: 'The telephone number must be between 10 and 15 digits.',
  })
  telephone: string;

  @IsNotEmpty({ message: 'The date of birth is required.' })
  // Valid date format or yyyy-mm-dd or dd-mm-yyyy
  @IsDateFormat()
  @TransformDate()
  dateOfBirth: Date;

  @IsEmail({}, { message: 'The email must be a valid email address.' })
  @IsNotEmpty({ message: 'The email is required.' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 20, {
    message: 'The password must be between 8 and 20 characters long.',
  })
  password: string;

  @ValidateIf((o) => o.password && o.confirmPassword)
  @IsString()
  @IsNotEmpty()
  @Length(8, 20, {
    message: 'The confirm password must be between 8 and 20 characters long.',
  })
  @IsPasswordMatch('password', {
    message: 'Password and confirm password do not match.',
  })
  confirmPassword: string;

  @IsOptional()
  @IsLatitude({ message: 'The latitude must be a valid coordinate.' })
  latitude?: number;

  @IsOptional()
  @IsLongitude({ message: 'The longitude must be a valid coordinate.' })
  longitude?: number;
}
