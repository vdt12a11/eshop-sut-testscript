module.exports = {
  testEnvironment: 'node',
  rootDir: __dirname,
  testMatch: [
    '<rootDir>/database/structural/*.test.js',
    '<rootDir>/database/functional/*.test.js',
  ],
  testTimeout: 20000,
  clearMocks: true,
  verbose: true,
  cacheDirectory: '<rootDir>/.tmp/jest-cache',
};
