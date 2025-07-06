import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import supertest from 'supertest';

export let app: INestApplication;
export let server: ReturnType<typeof supertest>;

export const setupE2ETestApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  server = supertest(app.getHttpServer());
};
