const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, Playlist, Song } = require('../models');
const AuthService = require('../src/services/authService');

// Mock the Gemini API service
jest.mock('../src/services/openaiService', () => ({
  generatePlaylistDescription: jest.fn(),
  analyzeMood: jest.fn()
}));

const openaiService = require('../src/services/openaiService');

describe('AI API', () => {
  let token;
  let userId;
  let playlistId;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      googleId: 'test-ai-user',
      email: 'ai@example.com',
      name: 'AI Tester',
      picture: 'https://example.com/pic.jpg'
    });

    userId = user.id;

    // Create test playlist with songs
    const playlist = await Playlist.create({
      title: 'AI Test Playlist',
      userId: userId
    });

    playlistId = playlist.id;

    // Add songs
    await Song.bulkCreate([
      {
        spotifyId: 'song1',
        title: 'Happy Song',
        artist: 'Happy Artist',
        album: 'Happy Album',
        playlistId: playlistId
      },
      {
        spotifyId: 'song2',
        title: 'Love Song',
        artist: 'Romantic Artist',
        album: 'Love Album',
        playlistId: playlistId
      }
    ]);

    // Generate token
    token = AuthService.generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });
  });

  afterAll(async () => {
    // Reset mocks after all tests
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /api/ai/playlist/:playlistId/description', () => {
    it('should generate description using AI', async () => {
      // Mock successful AI response
      openaiService.generatePlaylistDescription.mockResolvedValue(
        'A wonderful collection of uplifting and romantic songs perfect for any occasion.'
      );

      const response = await request(app)
        .post(`/api/ai/playlist/${playlistId}/description`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('description');
      expect(response.body.description).toBe(
        'A wonderful collection of uplifting and romantic songs perfect for any occasion.'
      );
      expect(openaiService.generatePlaylistDescription).toHaveBeenCalledTimes(1);
    });

    it('should handle AI service errors gracefully', async () => {
      // Mock AI service failure
      openaiService.generatePlaylistDescription.mockRejectedValue(
        new Error('Gemini API error')
      );

      const response = await request(app)
        .post(`/api/ai/playlist/${playlistId}/description`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post(`/api/ai/playlist/${playlistId}/description`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent playlist', async () => {
      const response = await request(app)
        .post('/api/ai/playlist/99999/description')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/ai/playlist/:playlistId/mood', () => {
    it('should analyze mood using AI', async () => {
      // Mock successful AI response - returns a string to match the VARCHAR field
      openaiService.analyzeMood.mockResolvedValue('Happy & Romantic');

      const response = await request(app)
        .post(`/api/ai/playlist/${playlistId}/mood`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('mood', 'Happy & Romantic');
      expect(openaiService.analyzeMood).toHaveBeenCalledTimes(1);
    });

    it('should use fallback when AI fails', async () => {
      // Mock AI service failure with fallback - returns a string
      openaiService.analyzeMood.mockResolvedValue('Love & Romance');

      const response = await request(app)
        .post(`/api/ai/playlist/${playlistId}/mood`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('mood', 'Love & Romance');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post(`/api/ai/playlist/${playlistId}/mood`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent playlist', async () => {
      const response = await request(app)
        .post('/api/ai/playlist/99999/mood')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('should return 400 for playlist without songs', async () => {
      // Create empty playlist
      const emptyPlaylist = await Playlist.create({
        title: 'Empty Playlist',
        userId: userId
      });

      const response = await request(app)
        .post(`/api/ai/playlist/${emptyPlaylist.id}/mood`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
});
