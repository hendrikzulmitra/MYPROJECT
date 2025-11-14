const AuthService = require('../services/authService');

class AuthController {
  // Get Google OAuth URL
  static async getGoogleUrl(req, res, next) {
    try {
      const url = AuthService.getGoogleAuthUrl();
      res.status(200).json({ url });
    } catch (error) {
      next(error);
    }
  }

  // Google OAuth Callback
  static async googleCallback(req, res, next) {
    try {
      const { code } = req.query;

      if (!code) {
        throw { name: 'BadRequest', message: 'Authorization code not provided' };
      }

      // Get tokens from Google
      const { id_token, access_token } = await AuthService.getGoogleTokens(code);

      // Get user info
      const googleUser = await AuthService.getGoogleUser(id_token, access_token);

      // Find or create user
      const user = await AuthService.findOrCreateUser(googleUser);

      // Generate JWT
      const token = AuthService.generateToken(user);

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      next(error);
    }
  }

  // Get current user
  static async getCurrentUser(req, res, next) {
    try {
      const { User } = require('../models');
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      });

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;