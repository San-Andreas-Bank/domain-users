import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('POST /auth/forgot-password', () => {
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

  it('debería enviar correo de recuperación de contraseña', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({
        email: 'chulded3@gmail.com',
      });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.msg).toContain('Email sent');
  }, 10000);
});
