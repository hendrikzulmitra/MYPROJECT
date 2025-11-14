const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, Playlist, Song } = require('../models');

describe('Authentication API', () => {
  describe('GET /api/auth/google', () => {
    it('should return Google OAuth URL', async () => {
      const response = await request(app)
        .get('/api/auth/google');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('url');
      expect(response.body.url).toContain('accounts.google.com');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('should return user data with valid token', async () => {
      // Create test user
      const user = await User.create({
        googleId: 'test-google-id',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/pic.jpg'
      });

      // Generate token
      const AuthService = require('../src/services/authService');
      const token = AuthService.generateToken({
        id: user.id,
        email: user.email,
        name: user.name
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', user.id);
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('name', 'Test User');
    });
  });
});
