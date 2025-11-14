# Backend Testing Guide

## Overview
This backend uses Jest and Supertest for comprehensive API testing.

## Test Structure

### Test Files
- `__tests__/auth.test.js` - Authentication endpoints (Google OAuth, JWT validation)
- `__tests__/playlists.test.js` - Playlist CRUD operations
- `__tests__/songs.test.js` - Song CRUD operations and Spotify search
- `__tests__/ai.test.js` - AI features (description generation, mood analysis)

### Setup Files
- `jest.config.js` - Jest configuration
- `__tests__/setup.js` - Test environment setup (runs before all tests)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test auth.test.js
npm test playlists.test.js
```

## Test Database

Tests use a separate test database (`spotai_test_db`) to avoid affecting development data.

### Configuration
- Database name: `spotai_test_db` (set in `__tests__/setup.js`)
- Each test suite syncs the database with `{ force: true }` (drops and recreates tables)
- Database connection is closed after each test suite

## Test Patterns

### Authentication Tests
- Google OAuth URL generation
- JWT token validation
- Unauthorized access (401 errors)
- User data retrieval with valid token

### CRUD Tests
- Create operations with valid/invalid data
- Read operations (list all, get by ID)
- Update operations
- Delete operations
- 404 errors for non-existent resources
- 401 errors without authentication

### AI Tests
- Mocked Gemini API responses (to avoid external API calls)
- Successful AI generation
- Fallback behavior when AI fails
- Empty playlist validation

## Mocking

### Gemini API
The `openaiService` is mocked in AI tests to:
- Avoid hitting external API limits
- Ensure consistent test results
- Test both success and failure scenarios

```javascript
jest.mock('../src/services/openaiService', () => ({
  generatePlaylistDescription: jest.fn(),
  analyzeMood: jest.fn()
}));
```

## Best Practices

1. **Isolation**: Each test suite is independent (database reset between suites)
2. **Authentication**: Use helper function to generate test tokens
3. **Cleanup**: Close database connections in `afterAll` hooks
4. **Mocking**: Mock external services (Gemini, Spotify) to avoid dependencies
5. **Coverage**: Aim for high coverage of endpoints and error cases

## Coverage Report

After running `npm run test:coverage`, check:
- `coverage/lcov-report/index.html` - Visual coverage report
- `coverage/` folder - Detailed coverage data

Target: >80% coverage for routes, controllers, and services

## Troubleshooting

### Database Connection Errors
- Ensure PostgreSQL is running
- Check test database exists: `spotai_test_db`
- Verify database credentials in `.env`

### Timeout Errors
- Increase timeout in `__tests__/setup.js`: `jest.setTimeout(15000)`
- Check for unclosed database connections

### Failed Tests After Code Changes
- Run `npm run test:coverage` to identify missing test cases
- Update test expectations if API responses changed
- Add new tests for new features
