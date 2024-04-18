// tests/integration/attendance.test.js
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../app'); // Path to your Express app
const Attendance = require('../../models/attendance.model');

describe('Attendance API', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Attendance.deleteMany({});
  });

  test('GET /attendances should fetch attendances', async () => {
    const attendance = new Attendance({
      punch: 1,
      status: 1,
      timestamp: new Date('2024-04-01T00:00:00Z'),
      uid: 123,
      user_id: 'user_123'
    });
    await attendance.save();

    const response = await request(app).get('/api/attendances');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ user_id: 'user_123' })
    ]));
  });

  test('DELETE /api/attendances/all should delete all attendances', async () => {
    await request(app).delete('/api/attendances/all');
    const attendances = await Attendance.find({});
    expect(attendances.length).toBe(0);
  });
});

