/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  collectCoverage: true,

  coverageReporters: ['text', 'cobertura'],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // A set of global variables that need to be available in all test environments
  // globals: {
  //   'ts-jest': {
  //     tsconfig: './tsconfig.json',
  //     useESM: true,
  //   },
  // },

  // The maximum amount of workers used to run your tests. Can be specified as % or a number. E.g. maxWorkers: 10% will use 10% of your CPU amount + 1 as the maximum worker number. maxWorkers: 2 will use a maximum of 2 workers.
  maxWorkers: 1,

  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: ['node_modules'],

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',

  // The root directory that Jest should scan for tests and modules within
  rootDir: './',

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: ['/node_modules/'],

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.json',
        useESM: true,
      },
    ],
  },
};

export default config;
