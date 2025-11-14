const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');
const authentication = require('../middlewares/authentication');

router.use(authentication);

router.post('/playlist/:playlistId/description', AIController.generateDescription);
router.post('/playlist/:playlistId/mood', AIController.analyzeMood);
router.get('/recommendations', AIController.getRecommendations);

module.exports = router;