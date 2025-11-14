const spotifyService = require('../services/spotifyService');

class SpotifyController {
  // Search tracks
  static async searchTracks(req, res, next) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q) {
        throw { name: 'BadRequest', message: 'Search query is required' };
      }

      const tracks = await spotifyService.searchTracks(q, parseInt(limit));

      res.status(200).json(tracks);
    } catch (error) {
      next(error);
    }
  }

  // Get track details
  static async getTrack(req, res, next) {
    try {
      const { id } = req.params;

      const track = await spotifyService.getTrack(id);

      res.status(200).json(track);
    } catch (error) {
      next(error);
    }
  }

  // Get recommendations
  static async getRecommendations(req, res, next) {
    try {
      const { genres = 'pop', limit = 10 } = req.query;

      const genresArray = genres.split(',');
      const tracks = await spotifyService.getRecommendations(genresArray, parseInt(limit));

      res.status(200).json(tracks);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SpotifyController;