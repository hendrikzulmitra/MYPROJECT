const OpenAIService = require('../services/openaiService');
const { Playlist, Song } = require('../models');

class AIController {
  // Generate playlist description
  static async generateDescription(req, res, next) {
    try {
      const { playlistId } = req.params;

      const playlist = await Playlist.findByPk(playlistId, {
        include: [{
          model: Song,
          as: 'songs'
        }]
      });

      if (!playlist) {
        throw { name: 'NotFound', message: 'Playlist not found' };
      }

      if (playlist.userId !== req.user.id) {
        throw { name: 'Forbidden', message: 'You are not authorized' };
      }

      if (playlist.songs.length === 0) {
        throw { name: 'BadRequest', message: 'Playlist must have at least one song' };
      }

      // debug log
      console.debug(`[AI] generateDescription playlistId=${playlistId} userId=${req.user.id} songs=${playlist.songs.length}`);

      const description = await OpenAIService.generatePlaylistDescription(
        playlist.title,
        playlist.songs
      );

      await playlist.update({ aiDescription: description });

      res.status(200).json({ description });
    } catch (error) {
      next(error);
    }
  }

  // Analyze playlist mood
  static async analyzeMood(req, res, next) {
    try {
      const { playlistId } = req.params;

      const playlist = await Playlist.findByPk(playlistId, {
        include: [{
          model: Song,
          as: 'songs'
        }]
      });

      if (!playlist) {
        throw { name: 'NotFound', message: 'Playlist not found' };
      }

      if (playlist.userId !== req.user.id) {
        throw { name: 'Forbidden', message: 'You are not authorized' };
      }

      if (playlist.songs.length === 0) {
        throw { name: 'BadRequest', message: 'Playlist must have at least one song' };
      }

      // debug log
      console.debug(`[AI] analyzeMood playlistId=${playlistId} userId=${req.user.id} songs=${playlist.songs.length}`);

      const mood = await OpenAIService.analyzeMood(playlist.songs);

      // debug log mood result
      console.debug(`[AI] analyzeMood result=${mood}`);

      await playlist.update({ mood });

      res.status(200).json({ mood });
    } catch (error) {
      next(error);
    }
  }

  // Get AI recommendations
  static async getRecommendations(req, res, next) {
    try {
      const { mood } = req.query;

      if (!mood) {
        throw { name: 'BadRequest', message: 'Mood parameter is required' };
      }

      const recommendations = await OpenAIService.getRecommendations(mood, 5);

      res.status(200).json({ recommendations });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AIController;