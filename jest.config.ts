import { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  extensionsToTreatAsEsm: [".ts"],
  testPathIgnorePatterns: ["/node_modules"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@game/(.+).js": "<rootDir>/src/game/$1.ts",
    "^@pieces/(.+).js": "<rootDir>/src/pieces/$1.ts",
    "^@utils/(.+).js": "<rootDir>/src/utils/$1.ts",
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