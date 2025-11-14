// Test setup and global configuration
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.DB_NAME = 'spotai_test_db';
process.env.DB_USERNAME = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_HOST = '127.0.0.1';
process.env.DB_DIALECT = 'postgres';

// Increase timeout for database operations
jest.setTimeout(10000);

// Setup database before all tests
const { sequelize } = require('../models');

beforeAll(async () => {
  // Sync database once for all tests
  try {
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error('Database sync error:', error);
  }
});

afterAll(async () => {
  // Close database connection after all tests
  try {
    await sequelize.close();
  } catch (error) {
    console.error('Database close error:', error);
  }
});
