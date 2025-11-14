const axios = require('axios');

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.tokenUrl = 'https://accounts.spotify.com/api/token';
    this.apiUrl = 'https://api.spotify.com/v1';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get access token
  async getAccessToken() {
    try {
      // Check if token is still valid
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const response = await axios.post(
        this.tokenUrl,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64')
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 min buffer

      return this.accessToken;
    } catch (error) {
      console.error('Spotify Auth Error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  // Search tracks
  async searchTracks(query, limit = 10) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(`${this.apiUrl}/search`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          q: query,
          type: 'track',
          limit
        }
      });

      return response.data.tracks.items.map(track => ({
        spotifyId: track.id,
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        duration: track.duration_ms,
        previewUrl: track.preview_url,
        imageUrl: track.album.images[0]?.url || null,
        externalUrl: track.external_urls.spotify
      }));
    } catch (error) {
      console.error('Spotify Search Error:', error.response?.data || error.message);
      throw new Error('Failed to search tracks');
    }
  }

  // Get track details
  async getTrack(trackId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(`${this.apiUrl}/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const track = response.data;
      return {
        spotifyId: track.id,
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        duration: track.duration_ms,
        previewUrl: track.preview_url,
        imageUrl: track.album.images[0]?.url || null,
        externalUrl: track.external_urls.spotify
      };
    } catch (error) {
      console.error('Spotify Get Track Error:', error.response?.data || error.message);
      throw new Error('Failed to get track details');
    }
  }

  // Get recommendations based on genres
  async getRecommendations(seedGenres = ['pop'], limit = 10) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(`${this.apiUrl}/recommendations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          seed_genres: seedGenres.join(','),
          limit
        }
      });

      return response.data.tracks.map(track => ({
        spotifyId: track.id,
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        duration: track.duration_ms,
        previewUrl: track.preview_url,
        imageUrl: track.album.images[0]?.url || null,
        externalUrl: track.external_urls.spotify
      }));
    } catch (error) {
      console.error('Spotify Recommendations Error:', error.response?.data || error.message);
      throw new Error('Failed to get recommendations');
    }
  }
}

module.exports = new SpotifyService();