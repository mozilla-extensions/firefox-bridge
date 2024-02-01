export default {
  setupFilesAfterEnv: ["./test/setup.test.js"],
  testMatch: ["**/test/**/*.test.js"],
  testPathIgnorePatterns: ["./test/setup.test.js"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
};
