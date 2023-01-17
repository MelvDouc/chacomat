import { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  extensionsToTreatAsEsm: [".ts"],
  testPathIgnorePatterns: ["/node_modules", "/test", "/dist"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@chacomat/(.+)\\.js$": "<rootDir>/src/$1.ts"
  },
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true
      },
    ],
  },
};

export default config;