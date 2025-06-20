import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
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
import { ResetPasswordDto } from '../dto/password/reset-password.dto';
import { CreateLogoutDto } from '../dto/children-dto/create-logout.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly logger: Logger,
  ) {}

  /**
   * 🔑 Validates a user by checking their email and password.
   *
   * ---
   * 📅 **Date:** 2025-02-01
   * 👤 **Author:** David (david-chulde)
   * 🔍 **Scope:** Authentication Service
   *
   * ---
   * 🛠 **Parameters:**
   * @param {string} email - The email of the user attempting to log in.
   * @param {string} password - The plain text password provided by the user.
   *
   * 📤 **Returns:**
   * @returns {Promise<User | null>} The authenticated user if the credentials are valid, otherwise `null`.
   *
   * ❌ **Throws:**
   * @throws {UnauthorizedException} If user doesn't exist in the database or hashing errors occur during validation.
   *
   * ---
   * 📌 **Usage Example:**
   * ```ts
   * const user = await authService.validateUser('user@example.com', 'mypassword123');
   * if (user) {
   *   console.log('User authenticated:', user);
   * } else {
   *   console.log('Invalid credentials');
   * }
   * ```
   */
  async validateUser({
    email,
    password,
  }: CreateLoginDto): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  /**
   * 🔐 Creates a login session and generates an access token for the user.
   *
   * This method generates a JWT access token for the authenticated user, saves the token's
   * initialization and expiration timestamps in the database, and returns relevant user details.
   *
   * ---
   * 📅 **Date:** 2025-02-01
   * 👤 **Author:** David (david-chulde)
   * 🔍 **Scope:** Authentication Service
   *
   * ---
   * 🛠 **Parameters:**
   * @param {User} user - The authenticated user object, containing user details.
   *
   * 📤 **Returns:**
   * @returns {Promise<{ userId: string; username: string; accessToken: string }>}
   * An object containing:
   * - `userId`: The unique identifier of the user.
   * - `username`: The username derived from the user's email.
   * - `accessToken`: The JWT token for authentication.
   *
   * ❌ **Throws:**
   * @throws {InternalServerErrorException} If an error occurs while generating or storing the token.
   *
   * ---
   * 📌 **Usage Example:**
   * ```ts
   * const loginData = await authService.createLogin(user);
   * console.log(loginData.accessToken); // Outputs: eyJhbGciOiJIUzI1...
   * ```
   */
  async createLogin(
    user: User,
  ): Promise<{ userId: string; username: string; accessToken: string }> {
    try {
      const payload = { sub: user.id, email: user.email };

      // Generate token timestamps
      const initDateToken = new Date();
      const expirationToken = new Date(
        initDateToken.getTime() + TOKEN_EXPIRATION_MS,
      );
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: TOKEN_EXPIRATION_MS / 1000, // Convert ms to seconds
        algorithm: 'HS256', // default
      });

      // Store token timestamps in the user record
      user.initDateToken = initDateToken;
      user.expirationToken = expirationToken;
      user.token = accessToken;

      // Generate JWT access token
      await this.userRepository.save(user);

      return {
        userId: user.id,
        username: user.email.split('@')[0],
        accessToken,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error processing token');
    }
  }
  /**
   * 🚪 Logs out a user by clearing their authentication tokens.
   *
   * This method finds a user by email, removes their authentication tokens (`initDateToken`,
   * `expirationToken`, and `token`), and updates the database to reflect the logout status.
   *
   * ---
   * 📅 **Date:** 2025-02-01
   * 👤 **Author:** David (david-chulde)
   * 🔍 **Scope:** Authentication Service
   *
   * ---
   * 🛠 **Parameters:**
   * @param {CreateLogoutDto} param0 - The DTO containing the user's email.
   * @param {string} param0.email - The email of the user who is logging out.
   *
   * 📤 **Returns:**
   * @returns {Promise<{ ok: boolean; msg: string }>}
   * An object containing:
   * - `ok`: `true` if logout is successful.
   * - `msg`: A message confirming the logout process.
   *
   * ❌ **Throws:**
   * @throws {NotFoundException} If the user is not found in the database.
   * @throws {HttpException} If an unexpected error occurs during the logout process.
   *
   * ---
   * 📌 **Usage Example:**
   * ```ts
   *   const response = await authService.createLogout({ email: 'user@example.com' });
   *   console.log(response.msg); // Outputs: "Cleared & Logout session."
   * ```
   */
  async createLogout({
    email,
  }: CreateLogoutDto): Promise<{ ok: boolean; msg: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    // Logout: Clearing authentication tokens
    user.initDateToken = null;
    user.expirationToken = null;
    user.token = null;

    await this.userRepository.save(user);

    return { ok: true, msg: 'Cleared & Logout session.' };
  }

  /**
   * 📧 Checks if a user with the given email already exists in the database.
   *
   * ---
   * 📅 **Date:** 2025-02-01
   * 👤 **Author:** David (david-chulde)
   * 🔍 **Scope:** Authentication Service
   *
   * ---
   * 🛠 **Parameters:**
   * @param {CreateSignupDto} param0 - An object containing the user's email.
   * @param {string} param0.email - The email to check for duplication.
   *
   * 📤 **Returns:**
   * @returns {Promise<void>} Resolves if the email is not taken.
   *
   * ❌ **Throws:**
   * @throws {HttpException} If the email is already registered (`HttpStatus.BAD_REQUEST`).
   *
   * ---
   * 📌 **Usage Example:**
   * ```ts
   * try {
   *   await authService.userExists({ email: 'test@example.com' });
   * } catch (error) {
   *   console.error(error.message); // Outputs: "Email duplicated, please enter another email."
   * }
   * ```
   */
  async userExists({ email }: CreateSignupDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!!user)
      throw new HttpException(
        'Email duplicated, please enter another email.',
        HttpStatus.BAD_REQUEST,
      );
  }

  /**
   * 📝 Creates a new user account with hashed password and saves it to the database.
   *
   * This method hashes the user's password, converts the date of birth into a `Date` object,
   * and then creates and saves a new user record in the database.
   *
   * ---
   * 📅 **Date:** 2025-02-01
   * 👤 **Author:** David (david-chulde)
   * 🔍 **Scope:** Authentication Service
   *
   * ---
   * 🛠 **Parameters:**
   * @param {Partial<User>} userData - An object containing user details for account creation.
   * - `password`: The plain-text password to be hashed.
   * - `dateOfBirth`: A string representation of the user's date of birth (converted to a `Date`).
   *
   * 📤 **Returns:**
   * @returns {Promise<{ code: string; userInfo: { id: string; name: string; lastName: string; email: string } }>}
   * An object containing:
   * - `code`: Success response code (`'01'`).
   * - `userInfo`: An object with the newly created user's basic details.
   *
   * ❌ **Throws:**
   * @throws {Error} If an issue occurs during password hashing or database saving.
   *
   * ---
   * 📌 **Usage Example:**
   * ```ts
   * const newUser = await authService.createSignup({
   *   name: 'John',
   *   lastName: 'Doe',
   *   email: 'john.doe@example.com',
   *   password: 'securePassword123',
   *   dateOfBirth: '1990-01-01',
   * });
   * console.log(newUser);
   * ```
   */
  async createSignup(userData: Partial<User>): Promise<any> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      dateOfBirth: new Date(userData.dateOfBirth), // Convert string to Date
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

  /**
   * 🔑 Initiates the password reset process for a user.
   *
   * This method checks if a user exists for the given email, and if found,
   * triggers the password reset email containing an OTP and reset link.
   *
   * ---
   * 📅 **Date:** 2025-02-01
   * 👤 **Author:** David (david-chulde)
   * 🔍 **Scope:** Authentication Service
   *
   * ---
   * 🛠 **Parameters:**
   * @param {ForgotPasswordDto} param0 - The DTO containing the user's email.
   * @param {string} param0.email - The email address of the user requesting a password reset.
   *
   * 📤 **Returns:**
   * @returns {Promise<void | NotFoundException>}
   * Resolves if the password reset email is successfully sent.
   * Returns a `NotFoundException` if the user does not exist.
   *
   * ❌ **Throws:**
   * @throws {NotFoundException} If no user is found with the provided email.
   * @throws {HttpException} If an internal server error occurs during the process.
   *
   * ---
   * 📌 **Usage Example:**
   * ```ts
   * try {
   *   await authService.forgotPassword({ email: 'user@example.com' });
   *   console.log('Password reset email sent.');
   * } catch (error) {
   *   console.error(error.message); // Outputs: "No user found for email: user@example.com"
   * }
   * ```
   */
  async forgotPassword({
    email,
  }: ForgotPasswordDto): Promise<void | HttpException> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      this.logger.log('Checking user existence');
      console.log(user);

      if (!user) {
        throw new HttpException(
          `No user found for email: ${email}`,
          HttpStatus.BAD_REQUEST,
        );
      }

       // 👇 Agrega estas líneas para mostrar OTP y token
      console.log(`🔐 Reset info para ${email}:`);
      console.log(`OTP: ${user.resetPasswordOTP}`);
      console.log(`Token: ${user.resetPasswordToken}`);

      // Send reset password email
      await this.emailService.sendResetPasswordLink(email);
    } catch (error) {
      this.logger.error('Error in forgotPassword function', error);

      throw new HttpException(
        `No user found for email: ${email}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 🔑 Resets a user's password using a One-Time Password (OTP).
   *
   * This method verifies the provided 6-digit OTP, checks its validity and expiration,
   * and allows the user to set a new password. If successful, the OTP is invalidated
   * to prevent reuse.
   *
   * ---
   * 📅 **Date:** 2025-02-01
   * 👤 **Author:** David (david-chulde)
   * 🔍 **Scope:** Authentication Service
   *
   * ---
   * 🛠 **Parameters:**
   * @param {string} otp - A 6-digit OTP code sent to the user's email.
   * @param {string} email - The email address associated with the user.
   * @param {string} newPassword - The new password to be set.
   *
   * 📤 **Returns:**
   * @returns {Promise<boolean>} `true` if the password was successfully reset.
   *
   * ❌ **Throws:**
   * @throws {NotFoundException} If no user is found for the given email.
   * @throws {BadRequestException} If the OTP is invalid or has expired.
   *
   * ---
   * 📌 **Usage Example:**
   * ```ts
   * await authService.resetPasswordOTP('123456', 'user@example.com', 'NewSecurePass123');
   * ```
   */
  async resetPasswordOTP(
    otp: string,
    email: string,
    newPassword: string,
  ): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        throw new NotFoundException(`No user found for email: ${email}`);
      }

      // Validate OTP
      if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) {
        throw new BadRequestException('Invalid OTP');
      }

      // Check if OTP has expired
      if (
        !user.resetPasswordExpires ||
        user.resetPasswordExpires < new Date()
      ) {
        throw new BadRequestException('OTP has expired');
      }
      // Update password and invalidate OTP
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetPasswordOTP = null; // Invalidate OTP
      user.resetPasswordExpires = null; // Reset expiration
      user.resetPasswordToken = null; // if it has this field to set null
      await this.userRepository.save(user);

      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      )
        throw error;

      throw new HttpException(
        'Internal Error Forgot Password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 🔐 Resets a user's password using a verification token.
   *
   * This method verifies the provided reset token, retrieves the associated user,
   * and updates their password. Once the password is reset, the token is invalidated
   * to prevent reuse.
   *
   * ---
   * 📅 **Date:** 2025-02-01
   * 👤 **Author:** David (david-chulde)
   * 🔍 **Scope:** Authentication Service
   *
   * ---
   * 🛠 **Parameters:**
   * @param {string} token - The reset password token provided to the user.
   * @param {string} newPassword - The new password to be set.
   *
   * 📤 **Returns:**
   * @returns {Promise<boolean>} `true` if the password was successfully reset.
   *
   * ❌ **Throws:**
   * @throws {NotFoundException} If no user is found for the decoded email.
   * @throws {HttpException} If an unexpected error occurs during the process.
   *
   * ---
   * 📌 **Usage Example:**
   * ```ts
   * await authService.resetPasswordToken('exampleToken123', 'NewSecurePass123');
   * ```
   */
  async resetPasswordToken(
    token: string,
    newPassword: string,
  ): Promise<boolean> {
    try {
      // Decode token to extract the email
      const email = await this.emailService.decodeConfirmationToken(token);
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new NotFoundException(`No token valid`);
      }

      // Check if Token has expired
      console.log(user);
      if (
        !user.resetPasswordExpires ||
        user.resetPasswordExpires < new Date()
      ) {
        throw new UnauthorizedException('OTP has expired');
      }

      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      // Reset token
      user.resetPasswordOTP = null; // if it has this field to set null
      user.resetPasswordExpires = null;
      user.resetPasswordToken = null;
      await this.userRepository.save(user);

      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      )
        throw error;

      throw new HttpException(
        'Internal Error Forgot Password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: any) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
