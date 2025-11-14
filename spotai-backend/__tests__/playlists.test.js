const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, Playlist, Song } = require('../models');
const AuthService = require('../src/services/authService');

describe('Playlist API', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      googleId: 'test-playlist-user',
      email: 'playlist@example.com',
      name: 'Playlist Tester',
      picture: 'https://example.com/pic.jpg'
    });

    userId = user.id;

    // Generate token
    token = AuthService.generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });
  });

  describe('POST /api/playlists', () => {
    it('should create a new playlist', async () => {
      const response = await request(app)
        .post('/api/playlists')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'My Test Playlist',
          description: 'A playlist for testing'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'My Test Playlist');
      expect(response.body).toHaveProperty('description', 'A playlist for testing');
      expect(response.body).toHaveProperty('userId', userId);
    });

    it('should return 400 without title', async () => {
      const response = await request(app)
        .post('/api/playlists')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'No title provided'
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/playlists')
        .send({
          title: 'Unauthorized Playlist'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/playlists', () => {
    beforeEach(async () => {
      // Clear and seed playlists
      await Playlist.destroy({ where: {} });
      await Playlist.bulkCreate([
        { title: 'Playlist 1', userId: userId },
        { title: 'Playlist 2', userId: userId, description: 'Second playlist' },
        { title: 'Playlist 3', userId: userId }
      ]);
    });

    it('should get all user playlists', async () => {
      const response = await request(app)
        .get('/api/playlists')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toHaveProperty('title');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/playlists');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/playlists/:id', () => {
    let playlistId;

    beforeEach(async () => {
      const playlist = await Playlist.create({
        title: 'Detail Test Playlist',
        description: 'For detail endpoint testing',
        userId: userId
      });
      playlistId = playlist.id;

      // Add some songs
      await Song.bulkCreate([
        {
          spotifyId: 'song1',
          title: 'Song 1',
          artist: 'Artist 1',
          album: 'Album 1',
          playlistId: playlistId
        },
        {
          spotifyId: 'song2',
          title: 'Song 2',
          artist: 'Artist 2',
          album: 'Album 2',
          playlistId: playlistId
        }
      ]);
    });

    it('should get playlist with songs', async () => {
      const response = await request(app)
        .get(`/api/playlists/${playlistId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'Detail Test Playlist');
      expect(response.body).toHaveProperty('songs');
      expect(Array.isArray(response.body.songs)).toBe(true);
      expect(response.body.songs).toHaveLength(2);
    });

    it('should return 404 for non-existent playlist', async () => {
      const response = await request(app)
        .get('/api/playlists/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/playlists/:id', () => {
    let playlistId;

    beforeEach(async () => {
      const playlist = await Playlist.create({
        title: 'Original Title',
        description: 'Original Description',
        userId: userId
      });
      playlistId = playlist.id;
    });

    it('should update playlist', async () => {
      const response = await request(app)
        .put(`/api/playlists/${playlistId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Title',
          description: 'Updated Description'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'Updated Title');
      expect(response.body).toHaveProperty('description', 'Updated Description');
    });

    it('should return 404 for non-existent playlist', async () => {
      const response = await request(app)
        .put('/api/playlists/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Title'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/playlists/:id', () => {
    let playlistId;

    beforeEach(async () => {
      const playlist = await Playlist.create({
        title: 'To Be Deleted',
        userId: userId
      });
      playlistId = playlist.id;
    });

    it('should delete playlist', async () => {
      const response = await request(app)
        .delete(`/api/playlists/${playlistId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verify deletion
      const playlist = await Playlist.findByPk(playlistId);
      expect(playlist).toBeNull();
    });

    it('should return 404 for non-existent playlist', async () => {
      const response = await request(app)
        .delete('/api/playlists/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});
