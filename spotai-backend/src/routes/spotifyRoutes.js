const express = require('express');
const router = express.Router();
const SpotifyController = require('../controllers/spotifyController');
const authentication = require('../middlewares/authentication');

router.use(authentication);

router.get('/search', SpotifyController.searchTracks);
router.get('/track/:id', SpotifyController.getTrack);
router.get('/recommendations', SpotifyController.getRecommendations);

module.exports = router;