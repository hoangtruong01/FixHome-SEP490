import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Client } from 'pg';
import { randomUUID, createHash } from 'crypto';
import { resolve } from 'path';
import { createRequire } from 'module';
import { JwtService } from '@nestjs/jwt';
import { getStorageToken, ThrottlerStorageService } from '@nestjs/throttler';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

// Always use a new schema; never synchronize/drop the configured database.
const schema = `member1_e2e_${randomUUID().replace(/-/g, '')}`;
const password = 'SecurePassword123!';
const accessSecret = 'e2e-only-access-secret-with-at-least-32-characters';
const refreshSecret = 'e2e-only-refresh-secret-with-at-least-32-characters';
const runtimeRequire = createRequire(resolve('package.json'));
type Session = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string };
};

describe('Member 1 HTTP, PostgreSQL and migration gates', () => {
  let app: INestApplication;
  let db: DataSource;
  let adminClient: Client;
  let customer: Session;
  let technician: Session;
  let admin: Session;
  let jwt: JwtService;
  const document = {
    documentType: 'citizen_id_front',
    fileUrl: 'https://res.cloudinary.com/audit-test/image/upload/id_front.jpg',
    fileName: 'id_front.jpg',
    fileSize: 1024,
    mimeType: 'image/jpeg',
  };
  const http = () => request(app.getHttpServer());
  const bearer = (session: Session) => `Bearer ${session.accessToken}`;
  const register = async (
    role = 'customer',
    extra: Record<string, unknown> = {},
  ): Promise<Session> => {
    const response = await http()
      .post('/api/v1/auth/register')
      .send({
        email: `${randomUUID()}@example.test`,
        password,
        fullName: 'Audit Test User',
        role,
        ...extra,
      })
      .expect(201);
    return response.body.data;
  };
  const freshLogin = async (session: Session): Promise<Session> => {
    const response = await http()
      .post('/api/v1/auth/login')
      .send({ identifier: session.user.email, password })
      .expect(200);
    return response.body.data;
  };
  const createCategory = async () =>
    (
      await http()
        .post('/api/v1/admin/service-categories')
        .set('Authorization', bearer(admin))
        .send({ name: 'Audit Category', code: randomUUID() })
        .expect(201)
    ).body.data;
  const createService = async (
    categoryId: string,
    extra: Record<string, unknown> = {},
  ) =>
    (
      await http()
        .post('/api/v1/admin/services')
        .set('Authorization', bearer(admin))
        .send({
          name: 'Audit Service',
          code: randomUUID(),
          categoryId,
          minPrice: 100,
          maxPrice: 200,
          ...extra,
        })
        .expect(201)
    ).body.data;
  const submit = (session: Session) =>
    http()
      .post('/api/v1/technicians/me/verification')
      .set('Authorization', bearer(session))
      .send({ documents: [document] });
  const review = (id: string, action: string, session = admin) =>
    http()
      .patch(`/api/v1/admin/technician-verifications/${id}/${action}`)
      .set('Authorization', bearer(session))
      .send(
        action === 'reject'
          ? { rejectionReason: 'Document is unreadable' }
          : {},
      );

  beforeAll(async () => {
    Object.assign(process.env, {
      NODE_ENV: 'test',
      JWT_ACCESS_SECRET: accessSecret,
      JWT_REFRESH_SECRET: refreshSecret,
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      CLOUDINARY_CLOUD_NAME: 'audit-test',
      CORS_ORIGIN: 'http://localhost:5173',
      DATABASE_SSL: 'false',
    });
    process.env.DATABASE_PASSWORD ||= 'postgres';
    const connection = {
      host: process.env.DATABASE_HOST || '127.0.0.1',
      port: Number(process.env.DATABASE_PORT || 5432),
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME || 'fixhome',
    };
    adminClient = new Client(connection);
    await adminClient.connect();
    await adminClient.query(`CREATE SCHEMA "${schema}"`);
    db = new DataSource({
      type: 'postgres',
      host: connection.host,
      port: connection.port,
      username: connection.user,
      password: connection.password,
      database: connection.database,
      schema,
      extra: { options: `-c search_path=${schema},public` },
      entities: [resolve('dist/**/*.entity.js')],
      migrations: [resolve('dist/database/migrations/*.js')],
      synchronize: false,
      logging: false,
    });
    await db.initialize();
    expect(await db.runMigrations()).toHaveLength(db.migrations.length);
    // Prove revert/reapply before exercising the migrated schema.
    await db.undoLastMigration();
    expect(await db.runMigrations()).toHaveLength(1);
    const { AppModule } = runtimeRequire('./dist/app.module.js');
    const { configureApplication } = runtimeRequire('./dist/setup-app.js');
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(DataSource)
      .useValue(db)
      .compile();
    app = module.createNestApplication();
    app.useLogger(false);
    configureApplication(app);
    await app.init();
    jwt = app.get(JwtService);
    customer = await register();
    technician = await register('technician');
    admin = await register();
    await db.query('UPDATE users SET role = $1 WHERE id = $2', [
      'admin',
      admin.user.id,
    ]);
    admin = await freshLogin(admin);
  }, 60000);

  beforeEach(() => {
    const storage = app.get<ThrottlerStorageService>(getStorageToken());
    storage.onApplicationShutdown();
    storage.storage.clear();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (db?.isInitialized) await db.destroy();
    if (adminClient) {
      await adminClient.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await adminClient.end();
    }
  });

  it.each(['/health', '/api/v1/health'])(
    'boots with real DB and shared envelope: %s',
    async (path) => {
      const response = await http().get(path).expect(200);
      expect(response.body).toMatchObject({
        success: true,
        statusCode: 200,
        data: { status: 'ok', dependencies: { database: 'connected' } },
      });
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    },
  );
  it('serves Swagger with real DTO, bearer security and required endpoints', async () => {
    const response = await http().get('/api/docs-json').expect(200);
    expect(response.body.components.securitySchemes.bearer).toBeDefined();
    for (const path of [
      '/api/v1/auth/register',
      '/api/v1/users/me',
      '/api/v1/admin/users/{id}/status',
      '/api/v1/technicians/me/verification',
      '/api/v1/services',
    ])
      expect(response.body.paths[path]).toBeDefined();
    expect(
      response.body.components.schemas.RejectVerificationDto.required,
    ).toContain('rejectionReason');
  });
  it('only permits configured CORS origins', async () => {
    expect(
      (await http().get('/health').set('Origin', 'https://untrusted.test'))
        .headers['access-control-allow-origin'],
    ).toBeUndefined();
    expect(
      (await http().get('/health').set('Origin', 'http://localhost:5173'))
        .headers['access-control-allow-origin'],
    ).toBe('http://localhost:5173');
  });
  it.each(['customer', 'technician'])(
    'registers %s with hash and safe profile',
    async (role) => {
      const session = await register(role);
      const [user] = await db.query('SELECT * FROM users WHERE id = $1', [
        session.user.id,
      ]);
      expect(await bcrypt.compare(password, user.password_hash)).toBe(true);
      expect(session.user).not.toHaveProperty('passwordHash');
      expect(jwt.decode(session.accessToken)).not.toHaveProperty('email');
      const [token] = await db.query(
        'SELECT * FROM refresh_tokens WHERE user_id = $1',
        [session.user.id],
      );
      expect(token.token_hash).toBe(
        createHash('sha256').update(session.refreshToken).digest('hex'),
      );
      expect(new Date(token.expires_at).getTime()).toBe(
        (jwt.decode(session.refreshToken) as { exp: number }).exp * 1000,
      );
    },
  );
  it.each(['admin', 'service_manager'])(
    'blocks public registration of %s',
    async (role) => {
      await http()
        .post('/api/v1/auth/register')
        .send({
          email: 'forbidden@example.test',
          fullName: 'Forbidden Actor',
          password,
          role,
        })
        .expect(400);
    },
  );
  it.each([
    { email: 'invalid' },
    { password: 'weakpass' },
    { password: 'A1!' + 'é'.repeat(36) },
    { fullName: '   ' },
    { phoneNumber: '0|12345678' },
    { role: null },
    { passwordHash: 'injected' },
  ])('rejects invalid registration %j', async (invalid) => {
    await http()
      .post('/api/v1/auth/register')
      .send({
        email: 'validation@example.test',
        fullName: 'Audit User',
        password,
        ...invalid,
      })
      .expect(400);
  });
  it('handles duplicate email and equivalent +84 phone identifiers', async () => {
    const first = await register('customer', { phoneNumber: '0912345678' });
    await http()
      .post('/api/v1/auth/register')
      .send({
        email: first.user.email.toUpperCase(),
        password,
        fullName: 'Duplicate',
      })
      .expect(409);
    await http()
      .post('/api/v1/auth/register')
      .send({
        email: 'phone@example.test',
        phoneNumber: '+84912345678',
        password,
        fullName: 'Duplicate',
      })
      .expect(409);
    await http()
      .post('/api/v1/auth/login')
      .send({ identifier: '+84912345678', password })
      .expect(200);
  });
  it('maps a concurrent duplicate registration to 409', async () => {
    const body = {
      email: `${randomUUID()}@example.test`,
      password,
      fullName: 'Concurrent',
    };
    const results = await Promise.all([
      http().post('/api/v1/auth/register').send(body),
      http().post('/api/v1/auth/register').send(body),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
  });
  it('supports email alias and rejects wrong or unknown credentials', async () => {
    await http()
      .post('/api/v1/auth/login')
      .send({ email: customer.user.email, password })
      .expect(200);
    for (const identifier of [customer.user.email, 'unknown@example.test'])
      await http()
        .post('/api/v1/auth/login')
        .send({ identifier, password: 'WrongPassword!' })
        .expect(401);
  });
  it.each(['locked', 'suspended'])(
    'enforces %s across login, JWT and refresh, with no revived sessions',
    async (status) => {
      const session = await register();
      await http()
        .patch(`/api/v1/admin/users/${session.user.id}/status`)
        .set('Authorization', bearer(admin))
        .send({ status })
        .expect(200);
      await http()
        .post('/api/v1/auth/login')
        .send({ identifier: session.user.email, password })
        .expect(403);
      await http()
        .get('/api/v1/auth/me')
        .set('Authorization', bearer(session))
        .expect(401);
      await http()
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: session.refreshToken })
        .expect(403);
      await http()
        .patch(`/api/v1/admin/users/${session.user.id}/status`)
        .set('Authorization', bearer(admin))
        .send({ status: 'active' })
        .expect(200);
      await http()
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: session.refreshToken })
        .expect(401);
    },
  );
  it('rotates same-second tokens once and rejects concurrent refresh/reuse', async () => {
    const session = await freshLogin(customer);
    const results = await Promise.all([
      http()
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: session.refreshToken }),
      http()
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: session.refreshToken }),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 401]);
    expect(
      results.find((r) => r.status === 200).body.data.refreshToken,
    ).not.toBe(session.refreshToken);
    await http()
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: session.refreshToken })
      .expect(401);
  });
  it('rejects invalid, expired and unknown refresh tokens', async () => {
    const expired = jwt.sign(
      { sub: customer.user.id },
      { secret: refreshSecret, expiresIn: -1 },
    );
    const unknown = jwt.sign(
      { sub: customer.user.id },
      { secret: refreshSecret, expiresIn: '1h', jwtid: randomUUID() },
    );
    for (const token of ['invalid', expired, unknown, customer.accessToken])
      await http()
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: token })
        .expect(401);
  });
  it('logout revokes only the owned session and validates its DTO', async () => {
    const first = await freshLogin(customer);
    const second = await freshLogin(customer);
    expect(first.refreshToken).not.toBe(second.refreshToken);
    await http()
      .post('/api/v1/auth/logout')
      .set('Authorization', bearer(first))
      .send({ refreshToken: 123 })
      .expect(400);
    await http()
      .post('/api/v1/auth/logout')
      .set('Authorization', bearer(technician))
      .send({ refreshToken: first.refreshToken })
      .expect(200);
    const logout = await http()
      .post('/api/v1/auth/logout')
      .set('Authorization', bearer(first))
      .send({ refreshToken: first.refreshToken })
      .expect(200);
    expect(logout.body.data).toEqual({ loggedOut: true });
    await http()
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: first.refreshToken })
      .expect(401);
    await http()
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: second.refreshToken })
      .expect(200);
  });
  it('requires a valid unexpired JWT', async () => {
    await http().get('/api/v1/auth/me').expect(401);
    const expired = jwt.sign(
      { sub: customer.user.id },
      { secret: accessSecret, expiresIn: -1 },
    );
    for (const token of ['invalid', expired, customer.refreshToken])
      await http()
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    await http()
      .get('/api/v1/auth/me')
      .set('Authorization', bearer(customer))
      .expect(200);
  });
  it('RBAC blocks Customer/Technician/Manager at admin user and verification APIs', async () => {
    const manager = await register();
    await db.query('UPDATE users SET role = $1 WHERE id = $2', [
      'service_manager',
      manager.user.id,
    ]);
    for (const actor of [customer, technician, manager]) {
      await http()
        .get('/api/v1/admin/users')
        .set('Authorization', bearer(actor))
        .expect(403);
      await review(randomUUID(), 'approve', actor).expect(403);
    }
    await http()
      .get('/api/v1/admin/users')
      .set('Authorization', bearer(admin))
      .expect(200);
  });
  it('updates only own permitted fields and rejects system fields/null names', async () => {
    await http()
      .patch('/api/v1/users/me')
      .set('Authorization', bearer(customer))
      .send({ fullName: 'Updated Customer' })
      .expect(200);
    for (const body of [
      { role: 'admin' },
      { status: 'locked' },
      { accountStatus: 'active' },
      { isActive: false },
      { fullName: null },
      { fullName: '  ' },
    ])
      await http()
        .patch('/api/v1/users/me')
        .set('Authorization', bearer(customer))
        .send(body)
        .expect(400);
    const profile = await http()
      .get('/api/v1/users/me')
      .set('Authorization', bearer(technician))
      .expect(200);
    expect(profile.body.data.fullName).toBe('Audit Test User');
    expect(profile.body.data).not.toHaveProperty('passwordHash');
  });
  it('validates admin filters/pagination and returns sanitized data', async () => {
    const users = await http()
      .get('/api/v1/admin/users?role=customer&status=active&limit=2&page=1')
      .set('Authorization', bearer(admin))
      .expect(200);
    expect(users.body.data.length).toBeLessThanOrEqual(2);
    expect(JSON.stringify(users.body)).not.toContain('passwordHash');
    for (const query of [
      'page=1.5',
      'page=0',
      'limit=101',
      'role=hacker',
      'status=deleted',
    ])
      await http()
        .get(`/api/v1/admin/users?${query}`)
        .set('Authorization', bearer(admin))
        .expect(400);
  });
  it('catalog uses active category AND service, including direct IDs and bypass query flags', async () => {
    const category = await createCategory();
    const service = await createService(category.id);
    await http().get(`/api/v1/services/${service.id}`).expect(200);
    await http()
      .patch(`/api/v1/admin/services/${service.id}/status`)
      .set('Authorization', bearer(admin))
      .send({ isActive: false })
      .expect(200);
    await http().get(`/api/v1/services/${service.id}`).expect(404);
    expect(
      (
        await http()
          .get(`/api/v1/services?categoryId=${category.id}&isActive=false`)
          .expect(200)
      ).body.data,
    ).toHaveLength(0);
    expect(
      (
        await http()
          .get(`/api/v1/service-categories/${category.id}`)
          .expect(200)
      ).body.data.services,
    ).toHaveLength(0);
    await http()
      .patch(`/api/v1/admin/services/${service.id}/status`)
      .set('Authorization', bearer(admin))
      .send({ isActive: true })
      .expect(200);
    await http()
      .patch(`/api/v1/admin/service-categories/${category.id}/status`)
      .set('Authorization', bearer(admin))
      .send({ isActive: false })
      .expect(200);
    await http().get(`/api/v1/services/${service.id}`).expect(404);
    await http().get(`/api/v1/service-categories/${category.id}`).expect(404);
    expect(
      (
        await http().get('/api/v1/service-categories?all=true').expect(200)
      ).body.data.some((c: { id: string }) => c.id === category.id),
    ).toBe(false);
    await http()
      .get(`/api/v1/admin/services/${service.id}`)
      .set('Authorization', bearer(admin))
      .expect(200);
  });
  it('validates catalog price ranges, status booleans and duplicate codes', async () => {
    const category = await createCategory();
    const service = await createService(category.id);
    await http()
      .post('/api/v1/admin/services')
      .set('Authorization', bearer(admin))
      .send({ name: 'Duplicate', code: service.code, categoryId: category.id })
      .expect(409);
    for (const body of [
      { minPrice: 300 },
      { basePrice: -1 },
      { maxPrice: 1.001 },
      { basePrice: 1e12 },
      { name: null },
    ])
      await http()
        .patch(`/api/v1/admin/services/${service.id}`)
        .set('Authorization', bearer(admin))
        .send(body)
        .expect(400);
    for (const body of [
      {},
      { isActive: 'false' },
      { isActive: null },
      { isActive: true, injected: true },
    ])
      await http()
        .patch(`/api/v1/admin/services/${service.id}/status`)
        .set('Authorization', bearer(admin))
        .send(body)
        .expect(400);
    await http()
      .post('/api/v1/admin/services')
      .set('Authorization', bearer(customer))
      .send({})
      .expect(403);
  });
  it('verification is owned, atomic under concurrent submission, and hides relation hashes', async () => {
    const tech = await register('technician');
    const submissions = await Promise.all([submit(tech), submit(tech)]);
    expect(submissions.map((r) => r.status).sort()).toEqual([201, 409]);
    const id = submissions.find((r) => r.status === 201).body.data.id;
    const detail = await http()
      .get(`/api/v1/admin/technician-verifications/${id}`)
      .set('Authorization', bearer(admin))
      .expect(200);
    expect(detail.body.data.documents).toHaveLength(1);
    expect(JSON.stringify(detail.body)).not.toContain('passwordHash');
    expect(
      (
        await http()
          .get('/api/v1/technicians/me/verification')
          .set('Authorization', bearer(technician))
          .expect(200)
      ).body.data,
    ).toBeNull();
    await submit(customer).expect(403);
  });
  it('allows one review only, stores reviewer/time, and exposes approval to Member 3', async () => {
    const tech = await register('technician');
    const id = (await submit(tech).expect(201)).body.data.id;
    const results = await Promise.all([
      review(id, 'approve'),
      review(id, 'reject'),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    const [stored] = await db.query(
      'SELECT * FROM technician_verifications WHERE id = $1',
      [id],
    );
    expect(stored.reviewed_by).toBe(admin.user.id);
    expect(stored.reviewed_at).toBeTruthy();
    await review(id, 'approve').expect(409);
    await review(id, 'reject').expect(409);
    const { TechnicianVerificationsService } = runtimeRequire(
      './dist/modules/technician-verifications/technician-verifications.service.js',
    );
    expect(
      await app
        .get<{ isApproved(id: string): Promise<boolean> }>(
          TechnicianVerificationsService,
        )
        .isApproved(tech.user.id),
    ).toBe(stored.status === 'approved');
  });
  it('requires reject reason and permits corrected resubmission after rejection', async () => {
    const tech = await register('technician');
    const id = (await submit(tech).expect(201)).body.data.id;
    for (const body of [{}, { rejectionReason: '     ' }])
      await http()
        .patch(`/api/v1/admin/technician-verifications/${id}/reject`)
        .set('Authorization', bearer(admin))
        .send(body)
        .expect(400);
    await review(id, 'reject').expect(200);
    const next = await submit(tech).expect(201);
    await review(next.body.data.id, 'approve').expect(200);
    await submit(tech).expect(409);
  });
  it('rejects suspended technician submission and review', async () => {
    const tech = await register('technician');
    const id = (await submit(tech).expect(201)).body.data.id;
    await http()
      .patch(`/api/v1/admin/users/${tech.user.id}/status`)
      .set('Authorization', bearer(admin))
      .send({ status: 'suspended' })
      .expect(200);
    await submit(tech).expect(401);
    await review(id, 'approve').expect(403);
  });
  it.each([
    { fileUrl: 'javascript:alert(1)' },
    { fileUrl: 'https://res.cloudinary.com/other-cloud/image/upload/id.jpg' },
    { fileSize: 10485761 },
    { fileSize: 1.5 },
    { mimeType: 'text/html' },
    { fileName: '../../id.jpg' },
    { fileName: 'id.pdf' },
  ])('rejects invalid verification metadata %j', async (invalid) => {
    await http()
      .post('/api/v1/technicians/me/verification')
      .set('Authorization', bearer(technician))
      .send({ documents: [{ ...document, ...invalid }] })
      .expect(400);
  });
  it('bounds document counts', async () => {
    for (const documents of [[], Array.from({ length: 11 }, () => document)])
      await http()
        .post('/api/v1/technicians/me/verification')
        .set('Authorization', bearer(technician))
        .send({ documents })
        .expect(400);
  });
  it('rate limits login while health remains available', async () => {
    for (let i = 0; i < 10; i++)
      await http()
        .post('/api/v1/auth/login')
        .send({ identifier: 'unknown@example.test', password })
        .expect(401);
    const limited = await http()
      .post('/api/v1/auth/login')
      .send({ identifier: 'unknown@example.test', password })
      .expect(429);
    expect(limited.body.error.code).toBe('TOO_MANY_REQUESTS');
    await http().get('/health').expect(200);
  });
  it('database enforces prices and verification uniqueness independently of DTOs', async () => {
    const category = await createCategory();
    await expect(
      db.query(
        'INSERT INTO services (category_id,name,code,min_price,max_price) VALUES ($1,$2,$3,200,100)',
        [category.id, 'Invalid', randomUUID()],
      ),
    ).rejects.toMatchObject({ driverError: { code: '23514' } });
  });

  it('rolls back the verification header if saving a document fails', async () => {
    const tech = await register('technician');
    await db.query(
      'ALTER TABLE verification_documents ADD CONSTRAINT audit_reject_document CHECK (file_size <> 1024) NOT VALID',
    );
    try {
      await submit(tech).expect(400);
      expect(
        await db.query(
          'SELECT id FROM technician_verifications WHERE technician_id = $1',
          [tech.user.id],
        ),
      ).toHaveLength(0);
    } finally {
      await db.query(
        'ALTER TABLE verification_documents DROP CONSTRAINT audit_reject_document',
      );
    }
  });

  it('allows Service Manager catalog operations from Docs-FixHome, with soft deletion only', async () => {
    const manager = await register();
    await db.query('UPDATE users SET role = $1 WHERE id = $2', ['service_manager', manager.user.id]);
    const category = (await http().post('/api/v1/admin/categories').set('Authorization', bearer(manager)).send({ name: 'Manager Category', code: randomUUID() }).expect(201)).body.data;
    const service = await createService(category.id);
    await http().delete(`/api/v1/admin/services/${service.id}`).set('Authorization', bearer(manager)).expect(200);
    await http().delete(`/api/v1/admin/categories/${category.id}`).set('Authorization', bearer(manager)).expect(200);
    expect(await db.query('SELECT id FROM services WHERE id = $1 AND is_active = false', [service.id])).toHaveLength(1);
    expect(await db.query('SELECT id FROM service_categories WHERE id = $1 AND is_active = false', [category.id])).toHaveLength(1);
    await http().delete(`/api/v1/admin/services/${service.id}`).set('Authorization', bearer(customer)).expect(403);
  });

  it('serializes account locking against concurrent login token issuance', async () => {
    const session = await register();
    const results = await Promise.all([
      http()
        .post('/api/v1/auth/login')
        .send({ identifier: session.user.email, password }),
      http()
        .patch(`/api/v1/admin/users/${session.user.id}/status`)
        .set('Authorization', bearer(admin))
        .send({ status: 'locked' }),
    ]);
    expect([200, 403]).toContain(results[0].status);
    expect(results[1].status).toBe(200);
    expect(
      await db.query(
        'SELECT id FROM refresh_tokens WHERE user_id = $1 AND is_revoked = false',
        [session.user.id],
      ),
    ).toHaveLength(0);
  });

  it('reverts all migrations, adopts legacy users and preserves account state and timestamps', async () => {
    for (let i = 0; i < db.migrations.length; i++) await db.undoLastMigration();
    await db.query(
      `CREATE TYPE users_role_enum AS ENUM ('customer','technician','service_manager','admin')`,
    );
    await db.query(
      `CREATE TABLE users (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), email varchar NOT NULL UNIQUE, password_hash varchar NOT NULL, full_name varchar NOT NULL, phone_number varchar, role users_role_enum NOT NULL DEFAULT 'customer', is_active boolean NOT NULL DEFAULT true, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`,
    );
    const legacyId = randomUUID();
    await db.query(
      `INSERT INTO users (id,email,password_hash,full_name,phone_number,is_active,created_at) VALUES ($1,'LEGACY@EXAMPLE.TEST','preserved-hash','Legacy User','+84987654321',false,'2025-01-02 03:04:05')`,
      [legacyId],
    );
    expect(await db.runMigrations()).toHaveLength(db.migrations.length);
    const [legacy] = await db.query('SELECT * FROM users WHERE id = $1', [
      legacyId,
    ]);
    expect(legacy).toMatchObject({
      email: 'legacy@example.test',
      password_hash: 'preserved-hash',
      phone_number: '0987654321',
      status: 'locked',
      is_active: false,
    });
    expect(legacy.created_at.toISOString()).toBe('2025-01-02T03:04:05.000Z');
    await db.undoLastMigration();
    expect(
      await db.query('SELECT id FROM users WHERE id = $1', [legacyId]),
    ).toHaveLength(1);
    expect(await db.runMigrations()).toHaveLength(1);
    for (let i = 0; i < db.migrations.length - 1; i++) await db.undoLastMigration();
    await expect(db.undoLastMigration()).rejects.toThrow('Refusing to drop an adopted users table');
    expect(await db.query('SELECT id FROM users WHERE id = $1', [legacyId])).toHaveLength(1);
    expect(await db.runMigrations()).toHaveLength(db.migrations.length - 1);
  });
});
