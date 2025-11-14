const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthService {
  // Get Google OAuth URL
  static getGoogleAuthUrl() {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  // Exchange code for tokens
  static async getGoogleTokens(code) {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code',
    };

    try {
      const response = await axios.post(url, new URLSearchParams(values), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch Google OAuth tokens');
    }
  }

  // Get user info from Google
  static async getGoogleUser(id_token, access_token) {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch user info');
    }
  }

  // Find or create user
  static async findOrCreateUser(googleUser) {
    const [user, created] = await User.findOrCreate({
      where: { googleId: googleUser.id },
      defaults: {
        googleId: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        role: 'user',
      },
    });

    return user;
  }

  // Generate JWT
  static generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  // Verify JWT
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = AuthService;