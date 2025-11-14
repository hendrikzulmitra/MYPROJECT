const { Playlist } = require('../models');

async function authorizePlaylistOwner(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const playlist = await Playlist.findByPk(id);

    if (!playlist) {
      throw { name: 'NotFound', message: 'Playlist not found' };
    }

    if (playlist.userId !== userId) {
      throw { name: 'Forbidden', message: 'You are not authorized' };
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authorizePlaylistOwner };