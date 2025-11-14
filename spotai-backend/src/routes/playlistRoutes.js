const express = require('express');
const router = express.Router();
const PlaylistController = require('../controllers/playlistController');
const authentication = require('../middlewares/authentication');
const { authorizePlaylistOwner } = require('../middlewares/authorization');

// All routes require authentication
router.use(authentication);

router.get('/', PlaylistController.getAllPlaylists);
router.post('/', PlaylistController.createPlaylist);
router.get('/:id', PlaylistController.getPlaylistById);
router.put('/:id', authorizePlaylistOwner, PlaylistController.updatePlaylist);
router.delete('/:id', authorizePlaylistOwner, PlaylistController.deletePlaylist);

module.exports = router;