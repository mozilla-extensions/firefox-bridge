import path from "path";
import webpack from "webpack";

export default {
  entry: {
    chromiumBackground: "./build/chromium/shared/backgroundScripts/background.js",
    chromiumWelcomePage: "./build/chromium/pages/welcomePage/script.js",
    firefoxBackground: "./build/firefox/shared/backgroundScripts/background.js",
    firefoxWelcomePage: "./build/firefox/pages/welcomePage/script.js",
  },
  output: {
    path: path.resolve("build"),
    filename:({ chunk }) => {
      if (chunk.name === "chromiumBackground") {
        return "chromium/background.bundle.js";
      } else if (chunk.name === "chromiumWelcomePage") {
        return "chromium/pages/welcomePage/script.bundle.js";
      } else if (chunk.name === "firefoxBackground") {
        return "firefox/background.bundle.js";
      } else if (chunk.name === "firefoxWelcomePage") {
        return "firefox/pages/welcomePage/script.bundle.js";
      }
    },
  },
  mode: "development",
  devtool: "inline-source-map",
};
