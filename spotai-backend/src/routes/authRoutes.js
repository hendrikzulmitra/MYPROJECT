const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authentication = require('../middlewares/authentication');

router.get('/google', AuthController.getGoogleUrl);
router.get('/google/callback', AuthController.googleCallback);
router.get('/me', authentication, AuthController.getCurrentUser);

module.exports = router;