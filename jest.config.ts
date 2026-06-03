/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const esmPackages = [
  '@alphafi',
  '@mmt-finance',
  '@msafe',
  '@mysten',
  '@noble',
  '@protobuf-ts',
  '@scallop-io',
  '@scure',
  '@suilend',
  'p-lazy',
].join('|');

const config: Config = {
  clearMocks: true,

  collectCoverage: true,

  coverageReporters: ['text', 'cobertura'],

  coverageDirectory: 'coverage',

  coverageProvider: 'v8',

  maxWorkers: 1,

  moduleDirectories: ['node_modules'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@mysten/sui/client$': '<rootDir>/src/shim/mysten-sui-client.ts',
  },

  preset: 'ts-jest',

  rootDir: './',

  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],

  testPathIgnorePatterns: ['/node_modules/'],

  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.json',
        useESM: true,
      },
    ],
    '^.+\\.[cm]?jsx?$': 'babel-jest',
  },

  transformIgnorePatterns: [`node_modules/(?!.*(${esmPackages})/)`],

  testTimeout: 30_000,

  extensionsToTreatAsEsm: ['.ts'],
};

export default config;
