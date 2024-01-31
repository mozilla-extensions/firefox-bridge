export default {
  setupFilesAfterEnv: ["./test/setup.test.js"],
  testMatch: ["**/test/**/*.test.js"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
};
