process.env.JWT_SECRET = 'test-only-secret-with-more-than-thirty-two-characters';

jest.mock('../models/user', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  updateOne: jest.fn()
}));
jest.mock('../models/post', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  deleteOne: jest.fn()
}));
jest.mock('bcryptjs', () => ({ hash: jest.fn(), compare: jest.fn() }));

const request = require('supertest');
const app = require('../app');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

describe('Social Feed API', () => {
  afterEach(() => jest.clearAllMocks());

  it('reports health without connecting to MongoDB', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('rejects feed access without a bearer token', async () => {
    const response = await request(app).get('/feed/posts');
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/authentication/i);
  });

  it('rejects malformed sign-up data before touching the database', async () => {
    const response = await request(app).put('/auth/signup').send({ email: 'bad', password: 'short', name: '' });
    expect(response.status).toBe(422);
    expect(User.create).not.toHaveBeenCalled();
  });

  it('rejects invalid bearer tokens with 401', async () => {
    const response = await request(app)
      .get('/auth/status')
      .set('Authorization', 'Bearer not-a-valid-token');
    expect(response.status).toBe(401);
  });

  it('returns a signed token after valid credentials', async () => {
    const user = { id: 'user-123', email: 'eslam@example.com', password: 'hashed-password' };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    bcrypt.compare.mockResolvedValue(true);

    const response = await request(app).post('/auth/login').send({
      email: 'eslam@example.com',
      password: 'correct-password'
    });
    expect(response.status).toBe(200);
    expect(response.body.userId).toBe('user-123');
    expect(typeof response.body.token).toBe('string');
  });
});
