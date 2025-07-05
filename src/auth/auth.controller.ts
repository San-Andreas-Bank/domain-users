import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Logger,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';

import { CreateSignupDto } from './dto/create-signup.dto';
import { CreateLoginDto } from './dto/children-dto/create-login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ForgotPasswordDto } from './dto/password/forgot-password.dto';
import { ResetPasswordDto } from './dto/password/reset-password.dto';
import {
  ResetMethodQuery,
  ResetPasswordQueryDto,
} from './dto/password/reset-password.query.dto';
import { CreateLogoutDto } from './dto/children-dto/create-logout.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: Logger,
  ) {}

  @Post('login')
  async createLogin(@Body() dto: CreateLoginDto) {
    const user = await this.authService.validateUser(dto);
    return await this.authService.createLogin(user);
  }

  @Post('logout')
  async createLogout(@Body() dto: CreateLogoutDto) {
    return await this.authService.createLogout(dto);
  }

  @Post('signup')
  async createSignup(@Body() dto: CreateSignupDto) {
    await this.authService.userExists(dto);
    return await this.authService.createSignup(dto);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ ok: boolean; msg: string }> {
    await this.authService.forgotPassword(dto);
    return { ok: true, msg: `Email sent to ${dto.email}` };
  }

  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Query() query: ResetPasswordQueryDto,
  ): Promise<{ ok: boolean; msg: string }> {
    if (!dto.otp && !dto.token) {
      throw new BadRequestException('Either OTP or Token must be provided.');
    }

    const successMsg = { ok: true, msg: 'Password successfully reseted.' };

    if (query.method === ResetMethodQuery.OTP) {
      const response = await this.authService.resetPasswordOTP(
        dto.otp,
        dto.email,
        dto.newPassword,
      );
      if (response) return successMsg;
    }

    if (query.method === ResetMethodQuery.TOKEN) {
      const response = await this.authService.resetPasswordToken(
        dto.token,
        dto.newPassword,
      );
      if (response) return successMsg;
    }

    throw new BadRequestException(
      'Invalid method or failed to reset password.',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Post()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: any) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
