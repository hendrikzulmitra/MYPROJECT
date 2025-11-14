const { Song, Playlist } = require('../models');

class SongController {
  // Get all songs in a playlist
  static async getSongsByPlaylist(req, res, next) {
    try {
      const { playlistId } = req.params;

      const playlist = await Playlist.findByPk(playlistId);
      if (!playlist) {
        throw { name: 'NotFound', message: 'Playlist not found' };
      }

      const songs = await Song.findAll({
        where: { playlistId },
        order: [['createdAt', 'ASC']]
      });

      res.status(200).json(songs);
    } catch (error) {
      next(error);
    }
  }

  // Add song to playlist
  static async addSong(req, res, next) {
    try {
      const { playlistId } = req.params;
      const { title, artist, album, spotifyId, previewUrl, duration, imageUrl } = req.body;

      // Verify playlist exists and user owns it
      const playlist = await Playlist.findByPk(playlistId);
      if (!playlist) {
        throw { name: 'NotFound', message: 'Playlist not found' };
      }

      if (playlist.userId !== req.user.id) {
        throw { name: 'Forbidden', message: 'You are not authorized' };
      }

      if (!title || !artist) {
        throw { name: 'BadRequest', message: 'Title and artist are required' };
      }

      const song = await Song.create({
        title,
        artist,
        album,
        spotifyId,
        previewUrl,
        duration,
        imageUrl: imageUrl || 'https://via.placeholder.com/300x300/1DB954/ffffff?text=Song',
        playlistId
      });

      res.status(201).json(song);
    } catch (error) {
      next(error);
    }
  }

  // Update song
  static async updateSong(req, res, next) {
    try {
      const { id } = req.params;
      const { title, artist, album } = req.body;

      const song = await Song.findByPk(id, {
        include: [{
          model: Playlist,
          as: 'playlist'
        }]
      });

      if (!song) {
        throw { name: 'NotFound', message: 'Song not found' };
      }

      // Check authorization
      if (song.playlist.userId !== req.user.id) {
        throw { name: 'Forbidden', message: 'You are not authorized' };
      }

      await song.update({
        title: title || song.title,
        artist: artist || song.artist,
        album: album !== undefined ? album : song.album
      });

      res.status(200).json(song);
    } catch (error) {
      next(error);
    }
  }

  // Delete song
  static async deleteSong(req, res, next) {
    try {
      const { id } = req.params;

      const song = await Song.findByPk(id, {
        include: [{
          model: Playlist,
          as: 'playlist'
        }]
      });

      if (!song) {
        throw { name: 'NotFound', message: 'Song not found' };
      }

      // Check authorization
      if (song.playlist.userId !== req.user.id) {
        throw { name: 'Forbidden', message: 'You are not authorized' };
      }

      await song.destroy();

      res.status(200).json({ message: 'Song deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SongController;