import request from 'supertest'; 
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('POST /auth/signup', () => {
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

  it('debería registrar un nuevo usuario con todos los campos requeridos', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'Carlos',
        lastName: 'Perez',
        telephone: '0991234567',
        dateOfBirth: '2000-01-01',
        email: 'chulded3@example.com',
        password: 'test1234',
        confirmPassword: 'test1234',
      });

    console.log(res.body); // 👈 Agrega esto
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('code', '01');
    expect(res.body).toHaveProperty('userInfo');
    expect(res.body.userInfo.email).toBe('chulded3@example.com');
    expect(res.body.userInfo.name).toBe('Carlos');
    expect(res.body.userInfo.lastName).toBe('Perez');
  }, 10000);
});
