const { Playlist, Song, User } = require('../models');

class PlaylistController {
  // Get all playlists (user's own playlists)
  static async getAllPlaylists(req, res, next) {
    try {
      const userId = req.user.id;
      
      const playlists = await Playlist.findAll({
        where: { userId },
        include: [
          {
            model: Song,
            as: 'songs',
            attributes: ['id', 'title', 'artist', 'imageUrl']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json(playlists);
    } catch (error) {
      next(error);
    }
  }

  // Get playlist by ID
  static async getPlaylistById(req, res, next) {
    try {
      const { id } = req.params;
      
      const playlist = await Playlist.findByPk(id, {
        include: [
          {
            model: Song,
            as: 'songs',
            order: [['createdAt', 'ASC']]
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'picture']
          }
        ]
      });

      if (!playlist) {
        throw { name: 'NotFound', message: 'Playlist not found' };
      }

      res.status(200).json(playlist);
    } catch (error) {
      next(error);
    }
  }

  // Create new playlist
  static async createPlaylist(req, res, next) {
    try {
      const { title, description, mood, coverImage } = req.body;
      const userId = req.user.id;

      if (!title) {
        throw { name: 'BadRequest', message: 'Title is required' };
      }

      const playlist = await Playlist.create({
        title,
        description,
        mood,
        coverImage: coverImage || 'https://via.placeholder.com/300x300/1DB954/ffffff?text=Playlist',
        userId
      });

      res.status(201).json(playlist);
    } catch (error) {
      next(error);
    }
  }

  // Update playlist
  static async updatePlaylist(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, mood, coverImage, aiDescription } = req.body;

      const playlist = await Playlist.findByPk(id);

      if (!playlist) {
        throw { name: 'NotFound', message: 'Playlist not found' };
      }

      await playlist.update({
        title: title || playlist.title,
        description: description !== undefined ? description : playlist.description,
        mood: mood || playlist.mood,
        coverImage: coverImage || playlist.coverImage,
        aiDescription: aiDescription !== undefined ? aiDescription : playlist.aiDescription
      });

      res.status(200).json(playlist);
    } catch (error) {
      next(error);
    }
  }

  // Delete playlist
  static async deletePlaylist(req, res, next) {
    try {
      const { id } = req.params;

      const playlist = await Playlist.findByPk(id);

      if (!playlist) {
        throw { name: 'NotFound', message: 'Playlist not found' };
      }

      await playlist.destroy();

      res.status(200).json({ message: 'Playlist deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PlaylistController;