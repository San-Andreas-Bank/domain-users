import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('POST /auth/profile', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Login para obtener el token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'chulded3@gmail.com',
        password: 'test1234',
      });

    token = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('debería obtener el perfil del usuario autenticado', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('email', 'chulded3@gmail.com');
  }, 10000);
});
