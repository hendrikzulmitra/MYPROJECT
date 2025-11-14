const AuthService = require('../services/authService');
const { User } = require('../models');

async function authentication(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw { name: 'Unauthorized', message: 'Please login first' };
    }

    const token = authHeader.split(' ')[1];
    const decoded = AuthService.verifyToken(token);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw { name: 'Unauthorized', message: 'User not found' };
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authentication;