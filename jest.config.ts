import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  roots: ['<rootDir>/src'],
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest"
  },
  testRegex: '(/__test__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/components/**/*.{ts,tsx}',
    '<rootDir>/src/components/*.{ts,tsx}'
  ],
  displayName: 'dom',
  testEnvironment: 'jest-environment-jsdom',
}

export default config;