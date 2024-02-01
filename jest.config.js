export default {
  setupFilesAfterEnv: ["./test/setup.test.js"],
  testMatch: ["**/test/**/*.test.js"],
  testPathIgnorePatterns: ["./test/setup.test.js", "./mozilla-unified/*"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
};
