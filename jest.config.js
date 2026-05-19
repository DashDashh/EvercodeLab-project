module.exports = {
  testEnvironment: "node",

  roots: ["<rootDir>"],

  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],

  testPathIgnorePatterns: ["/node_modules/"],

  verbose: true,

  collectCoverageFrom: [
    "*.js",
    "errors/**/*.js",
    "!**/node_modules/**",
    "!**/coverage/**",
  ],

  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
};
