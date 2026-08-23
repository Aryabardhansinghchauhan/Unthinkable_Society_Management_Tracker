import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import { User } from '../src/models/User';
import { Complaint } from '../src/models/Complaint';
import { Counter } from '../src/models/Counter';
import { Settings } from '../src/models/Settings';
import { COMPLAINT_STATUS } from '../src/config/constants';

jest.setTimeout(120000);

let mongoServer: MongoMemoryServer | null = null;
let adminToken: string;
let residentToken: string;
let residentId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  await Counter.create({ name: 'complaint', value: 1000 });
  await Settings.create({
    overdueThresholdHours: 24,
    defaultSlaByPriority: { LOW: 48, MEDIUM: 24, HIGH: 6 },
    societyName: 'Test Society',
    timezone: 'Asia/Kolkata',
  });

  // Create Resident
  const resResident = await request(app).post('/api/auth/register').send({
    name: 'Test Resident',
    email: 'resident.test@example.com',
    password: 'password123',
    flatNumber: 'B-204',
    building: 'Tower B',
  });
  residentToken = resResident.body.data.token;
  residentId = resResident.body.data.user._id;

  // Create Admin
  const resAdminLogin = await request(app).post('/api/auth/register').send({
    name: 'Admin Test 2',
    email: 'admin2.test@example.com',
    password: 'password123',
  });
  await User.findByIdAndUpdate(resAdminLogin.body.data.user._id, { role: 'ADMIN' });
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'admin2.test@example.com',
    password: 'password123',
  });
  adminToken = loginRes.body.data.token;
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('FixFlow Core API & Lifecycle Tests', () => {
  let createdComplaintId: string;
  let createdPublicId: string;

  test('POST /api/auth/login - should authenticate valid user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'resident.test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('resident.test@example.com');
  });

  test('POST /api/complaints - resident should create complaint with smart priority & publicId', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${residentToken}`)
      .send({
        category: 'Plumbing',
        title: 'Severe water leak flooding bathroom',
        description: 'Water leaking heavily from ceiling joint.',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.publicId).toMatch(/^FF-\d+$/);
    expect(res.body.data.status).toBe('OPEN');
    expect(res.body.data.priority).toBe('HIGH'); // Smart priority detected leak keyword
    expect(res.body.data.dueAt).toBeDefined();
    expect(res.body.data.isOverdue).toBe(false);

    createdComplaintId = res.body.data._id;
    createdPublicId = res.body.data.publicId;
  });

  test('GET /api/complaints/:id - should fetch complaint with timeline', async () => {
    const res = await request(app)
      .get(`/api/complaints/${createdComplaintId}`)
      .set('Authorization', `Bearer ${residentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.complaint.publicId).toBe(createdPublicId);
    expect(res.body.data.history.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.history[0].eventType).toBe('CREATED');
  });

  test('POST /api/complaints/:id/status - should transition OPEN to IN_PROGRESS', async () => {
    const res = await request(app)
      .post(`/api/complaints/${createdComplaintId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'IN_PROGRESS',
        note: 'Assigned and technician started work.',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  test('POST /api/complaints/:id/status - invalid transition OPEN from IN_PROGRESS should be rejected', async () => {
    const res = await request(app)
      .post(`/api/complaints/${createdComplaintId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'OPEN',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('POST /api/complaints/:id/status - transition IN_PROGRESS to RESOLVED', async () => {
    const res = await request(app)
      .post(`/api/complaints/${createdComplaintId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'RESOLVED',
        note: 'Fixed the leak and verified.',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('RESOLVED');
  });

  test('POST /api/complaints/:id/reopen - resident reopens resolved complaint with reason note', async () => {
    const res = await request(app)
      .post(`/api/complaints/${createdComplaintId}/reopen`)
      .set('Authorization', `Bearer ${residentToken}`)
      .send({
        note: 'Leak started dripping again when upper flat used water.',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('REOPENED');
  });

  test('GET /api/admin/dashboard - should calculate story-driven KPIs & attention queue', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.kpis).toBeDefined();
    expect(res.body.data.kpis.reopenedCount).toBeGreaterThanOrEqual(1);
    expect(res.body.data.attentionQueue.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/admin/recurring-issues - should return aggregation list', async () => {
    const res = await request(app)
      .get('/api/admin/recurring-issues')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
