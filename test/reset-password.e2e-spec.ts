import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('POST /auth/reset-password?method=otp', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('debería resetear la contraseña correctamente con OTP válido', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/reset-password?method=otp')
      .send({
        email: 'chulded3@gmail.com',
        otp: '415872',
        newPassword: 'nueva123davis1234',
      });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.msg).toContain('successfully reseted');
  }, 10000);
});
