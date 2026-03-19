import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Auth flow (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const createdEmails: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (createdEmails.length > 0) {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: createdEmails,
          },
        },
      });
    }

    await app.close();
  });

  it('supports register, login, refresh, me, and logout', async () => {
    const email = `auth-flow-${Date.now()}@cart-generator.local`;
    const password = 's3cure-passphrase';
    createdEmails.push(email);

    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        name: 'Auth Flow User',
        password,
      })
      .expect(201);

    expect(registerResponse.body.access_token).toEqual(expect.any(String));
    expect(registerResponse.body.refresh_token).toEqual(expect.any(String));
    expect(registerResponse.body.expires_in).toBe('15m');

    const meAfterRegister = await request(app.getHttpServer())
      .get('/api/v1/me')
      .set('authorization', `Bearer ${registerResponse.body.access_token}`)
      .expect(200);

    expect(meAfterRegister.body).toEqual(
      expect.objectContaining({
        email,
        name: 'Auth Flow User',
        role: 'user',
      }),
    );
    expect(meAfterRegister.body.auth_providers).toEqual(['password']);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email,
        password,
      })
      .expect(200);

    expect(loginResponse.body.access_token).toEqual(expect.any(String));
    expect(loginResponse.body.refresh_token).toEqual(expect.any(String));

    const refreshResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        refresh_token: loginResponse.body.refresh_token,
      })
      .expect(200);

    expect(refreshResponse.body.access_token).toEqual(expect.any(String));
    expect(refreshResponse.body.refresh_token).toEqual(expect.any(String));
    expect(refreshResponse.body.refresh_token).not.toBe(
      loginResponse.body.refresh_token,
    );

    const meAfterRefresh = await request(app.getHttpServer())
      .get('/api/v1/me')
      .set('authorization', `Bearer ${refreshResponse.body.access_token}`)
      .expect(200);

    expect(meAfterRefresh.body.email).toBe(email);

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('authorization', `Bearer ${refreshResponse.body.access_token}`)
      .send({
        refresh_token: refreshResponse.body.refresh_token,
      })
      .expect(200)
      .expect({
        success: true,
      });

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        refresh_token: refreshResponse.body.refresh_token,
      })
      .expect(401);
  });
});
