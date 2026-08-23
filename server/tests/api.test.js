"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const app_1 = __importDefault(require("../src/app"));
const User_1 = require("../src/models/User");
const Counter_1 = require("../src/models/Counter");
const Settings_1 = require("../src/models/Settings");
jest.setTimeout(120000);
let mongoServer = null;
let adminToken;
let residentToken;
let residentId;
beforeAll(async () => {
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose_1.default.connect(uri);
    await Counter_1.Counter.create({ name: 'complaint', value: 1000 });
    await Settings_1.Settings.create({
        overdueThresholdHours: 24,
        defaultSlaByPriority: { LOW: 48, MEDIUM: 24, HIGH: 6 },
        societyName: 'Test Society',
        timezone: 'Asia/Kolkata',
    });
    // Create Resident
    const resResident = await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send({
        name: 'Test Resident',
        email: 'resident.test@example.com',
        password: 'password123',
        flatNumber: 'B-204',
        building: 'Tower B',
    });
    residentToken = resResident.body.data.token;
    residentId = resResident.body.data.user._id;
    // Create Admin
    const resAdminLogin = await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send({
        name: 'Admin Test 2',
        email: 'admin2.test@example.com',
        password: 'password123',
    });
    await User_1.User.findByIdAndUpdate(resAdminLogin.body.data.user._id, { role: 'ADMIN' });
    const loginRes = await (0, supertest_1.default)(app_1.default).post('/api/auth/login').send({
        email: 'admin2.test@example.com',
        password: 'password123',
    });
    adminToken = loginRes.body.data.token;
}, 120000);
afterAll(async () => {
    await mongoose_1.default.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});
describe('FixFlow Core API & Lifecycle Tests', () => {
    let createdComplaintId;
    let createdPublicId;
    test('POST /api/auth/login - should authenticate valid user', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/auth/login').send({
            email: 'resident.test@example.com',
            password: 'password123',
        });
        expect(res.status).toBe(200);
        expect(res.body.data.token).toBeDefined();
        expect(res.body.data.user.email).toBe('resident.test@example.com');
    });
    test('POST /api/complaints - resident should create complaint with smart priority & publicId', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
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
        const res = await (0, supertest_1.default)(app_1.default)
            .get(`/api/complaints/${createdComplaintId}`)
            .set('Authorization', `Bearer ${residentToken}`);
        expect(res.status).toBe(200);
        expect(res.body.data.complaint.publicId).toBe(createdPublicId);
        expect(res.body.data.history.length).toBeGreaterThanOrEqual(1);
        expect(res.body.data.history[0].eventType).toBe('CREATED');
    });
    test('POST /api/complaints/:id/status - should transition OPEN to IN_PROGRESS', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
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
        const res = await (0, supertest_1.default)(app_1.default)
            .post(`/api/complaints/${createdComplaintId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            status: 'OPEN',
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });
    test('POST /api/complaints/:id/status - transition IN_PROGRESS to RESOLVED', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
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
        const res = await (0, supertest_1.default)(app_1.default)
            .post(`/api/complaints/${createdComplaintId}/reopen`)
            .set('Authorization', `Bearer ${residentToken}`)
            .send({
            note: 'Leak started dripping again when upper flat used water.',
        });
        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('REOPENED');
    });
    test('GET /api/admin/dashboard - should calculate story-driven KPIs & attention queue', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/admin/dashboard')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.data.kpis).toBeDefined();
        expect(res.body.data.kpis.reopenedCount).toBeGreaterThanOrEqual(1);
        expect(res.body.data.attentionQueue.length).toBeGreaterThanOrEqual(1);
    });
    test('GET /api/admin/recurring-issues - should return aggregation list', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/admin/recurring-issues')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
