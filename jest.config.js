/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  extensionsToTreatAsEsm: [".ts"],
  testPathIgnorePatterns: ["/node_modules"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
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