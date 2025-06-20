import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { createTransport, Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { EMAIL_RESET_PASSWORD_URL } from 'src/common/constants';
import { User } from 'src/auth/entities/user';
import { Repository } from 'typeorm';

/**
 * 📧 Email Service for sending authentication-related emails.
 *
 * This service is responsible for sending emails, including password reset links and OTP codes.
 * It integrates with **Nodemailer** and uses Gmail's SMTP server for email delivery.
 *
 * ---
 * 📅 **Date:** 2025-02-01
 * 👤 **Author:** David (david-chulde)
 * 🔍 **Scope:** Authentication Service
 */
@Injectable()
export class EmailService {
  nodemailerTransport: Transporter;

  /**
   * Initializes the email service and configures the Nodemailer transporter.
   *
   * @param {ConfigService} configService - Provides access to environment variables.
   * @param {JwtService} jwtService - Handles JWT generation and verification.
   * @param {Logger} logger - Logger instance for debugging and monitoring.
   * @param {Repository<User>} userRepository - Database repository for user-related queries.
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    // Configure Nodemailer transport for Gmail SMTP
    this.nodemailerTransport = createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: configService.get('EMAIL_USER'),
        pass: configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  /**
   * 🔑 Decodes and verifies a password reset confirmation token.
   *
   * This method verifies the provided JWT token, extracts the email if valid,
   * and returns it. If the token is expired or invalid, an appropriate error is thrown.
   *
   * ---
   * 📅 **Date:** 2025-02-01
   * 👤 **Author:** David (david-chulde)
   * 🔍 **Scope:** Authentication Service
   *
   * ---
   * 🛠 **Parameters:**
   * @param {string} token - The JWT password reset token to be decoded and verified.
   *
   * 📤 **Returns:**
   * @returns {Promise<string>} The extracted email from the token if verification is successful.
   *
   * ❌ **Throws:**
   * @throws {BadRequestException} If the token is invalid or missing the email field.
   * @throws {BadRequestException} If the token has expired.
   *
   * ---
   * 📌 **Usage Example:**
   * ```ts
   * const email = await authService.decodeConfirmationToken('eyJhbGciOiJIUzI...');
   * ```
   */
  public async decodeConfirmationToken(token: string): Promise<string> {
    try {
      // Verify the JWT token using the secret key
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get(
          'JWT_PASSWORD_VERIFICATION_TOKEN_SECRET',
        ),
      });

      // Check if the token contains an email field
      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }

      // Throw an error if payload is invalid
      throw new BadRequestException('Invalid token format');
    } catch (error) {
      // Handle specific JWT expiration error
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }

      // Handle general invalid token error
      throw new BadRequestException('Bad confirmation token');
    }
  }

  private sendMail(options: Mail.Options) {
    this.logger.log(`Email sent to ${options.to}`);
    return this.nodemailerTransport.sendMail(options);
  }

  /**
   * ✉️ Sends a password reset email containing an OTP and a reset link.
   *
   * This method generates a **6-digit OTP** and a **JWT reset token**, stores them in the database,
   * and sends a reset email to the user. The email provides two options:
   * - **OTP (One-Time Password)**: A code valid for 10 minutes.
   * - **Reset Link**: A clickable URL containing the JWT token.
   *
   * ---
   * 📅 **Date:** 2025-02-01
   * 👤 **Author:** David (david-chulde)
   * 🔍 **Scope:** Authentication Service
   *
   * ---
   * 🛠 **Parameters:**
   * @param {string} email - The email address of the user requesting the password reset.
   *
   * 📤 **Returns:**
   * @returns {Promise<void>} Resolves when the email is successfully sent.
   *
   * ❌ **Throws:**
   * @throws {NotFoundException} If the email is not found in the database.
   * @throws {HttpException} If an error occurs during the process.
   *
   * ---
   * 📌 **Usage Example:**
   * ```ts
   * await authService.sendResetPasswordLink('user@example.com');
   * ```
   */
  async sendResetPasswordLink(email: string): Promise<void> {
    const payload = { email };
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_PASSWORD_VERIFICATION_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_PASSWORD_VERIFICATION_TOKEN_EXPIRATION_TIME') ?? 10 * 60 * 1000}s`, // 10 minutes
    });

    this.logger.log(`token: \n${token} \notp: \n ${otp}`);
    // Save password token
    const user = await this.userRepository.findOne({ where: { email } });
    user.resetPasswordToken = token;
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = new Date(
      Date.now() +
        (Number(
          this.configService.get(
            'JWT_PASSWORD_VERIFICATION_TOKEN_EXPIRATION_TIME',
          ),
        ) ?? 10 * 60 * 1000),
    ); // Default expirate in 10 minutes
    await this.userRepository.save(user);

    const subject = '🔐 Reset Your Password';
    const resetUrl = `${EMAIL_RESET_PASSWORD_URL ?? 'http://localhost:3000/page/email-reset-password'}?token=${token}`;
    const previewText = `Use OTP ${otp} or click the reset link to recover your account.`;

    const text = this.getPlainText(resetUrl, otp);
    const html = this.getHtml(resetUrl, otp, previewText);

    return await this.sendMail({
      to: email,
      subject,
      text,
      html,
    });
  }

  /**
   * Generates the plain text version of the password reset email.
   *
   * @param {string} resetUrl - The URL for resetting the password.
   * @param {string} otp - The OTP code sent to the user.
   * @returns {string} A plain text email body.
   */
  private getPlainText(resetUrl: string, otp: string): string {
    return `Hi,

To reset your password, you can use one of the following methods:

1️⃣ OTP Code: ${otp} (valid for 10 minutes)
2️⃣ Reset Link: ${resetUrl}

If you did not request this, please ignore this email.

Best regards,
Streamverse Inc.`;
  }

  /**
   * Generates the HTML version of the password reset email.
   *
   * @param {string} resetUrl - The URL for resetting the password.
   * @param {string} otp - The OTP code sent to the user.
   * @param {string} previewText - A short preview text for email clients.
   * @returns {string} A fully formatted HTML email body.
   */
  private getHtml(resetUrl: string, otp: string, previewText: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="${previewText}">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1); }
          .button {
            display: inline-block;
            background-color: #007BFF;
            color: white;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            max-width: 250px;
            margin-top: 10px;
            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
          }
          .button:hover {
            background-color: #0056b3;
          }
          .content {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Password Reset Request</h2>
          <p>Hi,</p>
          <p>To reset your password, please use one of the following options. <strong>This request is valid for 10 minutes.</strong></p>
          <ul>
            <li><strong>OTP Code:</strong> <span style="font-size: 18px; font-weight: bold;">${otp}</span></li>
            <li><strong>Reset Link:</strong> <a href="${resetUrl}" style="color: #007BFF;">Click here to reset your password</a></li>
          </ul>
          <p>If you did not request this, ignore this email.</p>
          <p>Best regards,</p>
          <p><strong>Streamverse Inc.</strong></p>
        </div>
      </body>
      </html>
    `;
  }
}
