module.exports = {
  testEnvironment: "node",
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  testMatch: ["**/tests/**/*.test.js"],
};

