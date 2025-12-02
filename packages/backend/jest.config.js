const { readFileSync } = require('fs');
const path = require('path');

// Reading the SWC compilation config for the spec files
const swcJestConfig = JSON.parse(
  readFileSync(path.join(__dirname, '.spec.swcrc'), 'utf-8')
);

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves
swcJestConfig.swcrc = false;

module.exports = {
  displayName: '@noverlink/backend',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest/coverage',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^../app-config$': '<rootDir>/src/__mocks__/app-config.ts',
    '^../../app-config$': '<rootDir>/src/__mocks__/app-config.ts',
  },
};
