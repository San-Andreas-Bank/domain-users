import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateLoginDto } from '../dto/children-dto/create-login.dto';
import { CreateSignupDto } from '../dto/create-signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TOKEN_EXPIRATION_MS } from 'src/common/constants';
import { ForgotPasswordDto } from '../dto/password/forgot-password.dto';
import { EmailService } from './email/email.service';
import { CreateLogoutDto } from '../dto/children-dto/create-logout.dto';
import { UpdateAuthDto } from '../dto/password/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly logger: Logger,
  ) {}

  async validateUser({ email, password }: CreateLoginDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async createLogin(user: User): Promise<{ userId: string; username: string; accessToken: string }> {
    try {
      const payload = { sub: user.id, email: user.email };
      const initDateToken = new Date();
      const expirationToken = new Date(initDateToken.getTime() + TOKEN_EXPIRATION_MS);
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: TOKEN_EXPIRATION_MS / 1000,
        algorithm: 'HS256',
      });

      user.initDateToken = initDateToken;
      user.expirationToken = expirationToken;
      user.token = accessToken;

      await this.userRepository.save(user);

      return {
        userId: user.id,
        username: user.email.split('@')[0],
        accessToken,
      };
    } catch {
      throw new InternalServerErrorException('Error processing token');
    }
  }

  async createLogout({ email }: CreateLogoutDto): Promise<{ ok: boolean; msg: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    user.initDateToken = null;
    user.expirationToken = null;
    user.token = null;

    await this.userRepository.save(user);

    return { ok: true, msg: 'Cleared & Logout session.' };
  }

  async userExists({ email }: CreateSignupDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      throw new HttpException('Email duplicated, please enter another email.', HttpStatus.BAD_REQUEST);
    }
  }

  async createSignup(userData: Partial<User>): Promise<any> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      dateOfBirth: new Date(userData.dateOfBirth),
    });

    const userSaved = await this.userRepository.save(newUser);

    return {
      code: '01',
      userInfo: {
        id: userSaved.id,
        name: userSaved.name,
        lastName: userSaved.lastName,
        email: userSaved.email,
      },
    };
  }

  async forgotPassword({ email }: ForgotPasswordDto): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      this.logger.log('Checking user existence');
      if (!user) {
        throw new HttpException(`No user found for email: ${email}`, HttpStatus.BAD_REQUEST);
      }

      console.log(`🔐 Reset info para ${email}:`);
      console.log(`OTP: ${user.resetPasswordOTP}`);
      console.log(`Token: ${user.resetPasswordToken}`);

      await this.emailService.sendResetPasswordLink(email);
    } catch (error) {
      this.logger.error('Error in forgotPassword function', error);
      throw new HttpException(`No user found for email: ${email}`, HttpStatus.BAD_REQUEST);
    }
  }

  async resetPasswordOTP(otp: string, email: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    user.resetPasswordToken = null;

    await this.userRepository.save(user);

    return true;
  }

  async resetPasswordToken(token: string, newPassword: string): Promise<boolean> {
    try {
      const email = await this.emailService.decodeConfirmationToken(token);
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        throw new NotFoundException(`No token valid`);
      }

      if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
        throw new UnauthorizedException('Token has expired');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetPasswordOTP = null;
      user.resetPasswordExpires = null;
      user.resetPasswordToken = null;

      await this.userRepository.save(user);

      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new HttpException('Internal Error Forgot Password', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, dto: UpdateAuthDto): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = Object.assign(user, dto);
    await this.userRepository.save(updatedUser);

    return {
      ok: true,
      msg: `User with ID ${id} updated successfully`,
      data: updatedUser,
    };
  }

  async remove(id: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.delete(id);
    return {
      ok: true,
      msg: `User with ID ${id} deleted.`,
    };
  }
}
