const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, Playlist, Song } = require('../models');
const AuthService = require('../src/services/authService');

describe('Song API', () => {
  let token;
  let userId;
  let playlistId;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      googleId: 'test-song-user',
      email: 'song@example.com',
      name: 'Song Tester',
      picture: 'https://example.com/pic.jpg'
    });

    userId = user.id;

    // Create test playlist
    const playlist = await Playlist.create({
      title: 'Test Playlist for Songs',
      userId: userId
    });

    playlistId = playlist.id;

    // Generate token
    token = AuthService.generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });
  });

  describe('POST /api/songs/playlist/:playlistId', () => {
    it('should add a song to playlist', async () => {
      const response = await request(app)
        .post(`/api/songs/playlist/${playlistId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          spotifyId: 'test-spotify-id',
          title: 'Test Song',
          artist: 'Test Artist',
          album: 'Test Album',
          albumArt: 'https://example.com/art.jpg',
          previewUrl: 'https://example.com/preview.mp3',
          duration: 180000
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'Test Song');
      expect(response.body).toHaveProperty('artist', 'Test Artist');
      expect(response.body).toHaveProperty('playlistId', playlistId);
    });

    it('should return 400 without required fields', async () => {
      const response = await request(app)
        .post(`/api/songs/playlist/${playlistId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Missing Artist'
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post(`/api/songs/playlist/${playlistId}`)
        .send({
          spotifyId: 'no-auth',
          title: 'No Auth Song',
          artist: 'No Auth Artist'
        });

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent playlist', async () => {
      const response = await request(app)
        .post('/api/songs/playlist/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          spotifyId: 'test-id',
          title: 'Test',
          artist: 'Test'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/songs/:id', () => {
    let songId;

    beforeEach(async () => {
      const song = await Song.create({
        spotifyId: 'original-id',
        title: 'Original Title',
        artist: 'Original Artist',
        album: 'Original Album',
        playlistId: playlistId
      });
      songId = song.id;
    });

    it('should update song', async () => {
      const response = await request(app)
        .put(`/api/songs/${songId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Title',
          artist: 'Updated Artist'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'Updated Title');
      expect(response.body).toHaveProperty('artist', 'Updated Artist');
    });

    it('should return 404 for non-existent song', async () => {
      const response = await request(app)
        .put('/api/songs/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Title'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/songs/:id', () => {
    let songId;

    beforeEach(async () => {
      const song = await Song.create({
        spotifyId: 'to-delete',
        title: 'To Be Deleted',
        artist: 'Delete Artist',
        playlistId: playlistId
      });
      songId = song.id;
    });

    it('should delete song', async () => {
      const response = await request(app)
        .delete(`/api/songs/${songId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verify deletion
      const song = await Song.findByPk(songId);
      expect(song).toBeNull();
    });

    it('should return 404 for non-existent song', async () => {
      const response = await request(app)
        .delete('/api/songs/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/spotify/search', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/spotify/search')
        .query({ q: 'test' });

      expect(response.status).toBe(401);
    });

    it('should return 400 without query', async () => {
      const response = await request(app)
        .get('/api/spotify/search')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });

    // Note: Actual Spotify search test would require mocking or Spotify credentials
    // Skipping real API test to avoid external dependencies
  });
});
