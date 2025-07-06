import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('POST /auth/logout', () => {
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

  it('debería cerrar la sesión del usuario', async () => {
    const res = await request(app.getHttpServer()).post('/auth/logout').send({
      email: 'chulded3@gmail.com',
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      ok: true,
      msg: 'Cleared & Logout session.',
    });
  }, 10000);
});
