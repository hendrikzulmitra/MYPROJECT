const express = require('express');
const router = express.Router();
const SongController = require('../controllers/songController');
const authentication = require('../middlewares/authentication');

router.use(authentication);

router.get('/playlist/:playlistId', SongController.getSongsByPlaylist);
router.post('/playlist/:playlistId', SongController.addSong);
router.put('/:id', SongController.updateSong);
router.delete('/:id', SongController.deleteSong);

module.exports = router;