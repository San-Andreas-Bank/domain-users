import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('POST /auth/login', () => {
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

  it('debería iniciar sesión correctamente y devolver token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'chulded3@gmail.com',
        password: 'test1234',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('username');
  }, 10000);
});
