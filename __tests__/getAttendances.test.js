// tests/getAttendances.test.js
const axios = require('axios');
const axiosMock = new (require('axios-mock-adapter'))(axios);
const { getAttendances } = require('../controllers/attendances.controller');

describe('getAttendances', () => {
  it('fetches and syncs attendances successfully', async () => {
    const mockData = [{
      punch: 1,
      status: 1,
      timestamp: '2024-04-01T00:00:00Z',
      uid: 123,
      user_id: 'user_123'
    }];

    axiosMock.onGet('http://localhost:5000/attendances').reply(200, mockData);
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getAttendances(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ user_id: 'user_123' })
    ]));
  });
});
