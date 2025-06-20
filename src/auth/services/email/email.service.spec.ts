import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    // Mock Nodemailer
    const mockTransport = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'mocked-message-id' }),
    };
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransport);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key) => {
              if (key === 'EMAIL_USER') return 'test@example.com';
              if (key === 'EMAIL_PASSWORD') return 'testpassword';
              if (key === 'JWT_PASSWORD_VERIFICATION_TOKEN_SECRET')
                return 'mock-secret';
              return null;
            }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-jwt-token'),
            verify: jest.fn().mockReturnValue({ email: 'user@example.com' }),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a password reset email', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue({
      email: 'test@example.com',
      resetPasswordToken: null,
      resetPasswordOTP: null,
      resetPasswordExpires: null,
    } as User);

    jest.spyOn(userRepository, 'save').mockResolvedValue({} as User);

    await expect(
      service.sendResetPasswordLink('test@example.com'),
    ).resolves.not.toThrow();

    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException if user does not exist', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(
      service.sendResetPasswordLink('nonexistent@example.com'),
    ).rejects.toThrowError();
  });
});
