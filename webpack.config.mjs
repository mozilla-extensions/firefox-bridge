import path from "path";
import webpack from "webpack";
import CopyPlugin from "copy-webpack-plugin";

const target = process.env.NODE_ENV;
const isFirefoxExtension = target === "firefox";
const isChromiumExtension = target === "chromium";

const copyPluginPatterns = [
  {
    from: "src/_locales",
    to: target + "/_locales",
  },
  {
    from: "src/" + target,
    to: target,
    globOptions: {
      ignore: ["**/*.js"],
    },
  },
  {
    from: "src/shared",
    to: target + "/shared",
    globOptions: {
      ignore: ["**/*.js"],
    },
  }
];

// only copy the api.js file for firefox
if (isFirefoxExtension) {
  copyPluginPatterns.push({
    from: "src/firefox/api.js",
    to: target,
  });
}

const alias = {
  "Shared": path.resolve("src/shared"),
};
if (target === "firefox") {
  alias["Interfaces"] = path.resolve("src/firefox/interfaces");
} else {
  alias["Interfaces"] = path.resolve("src/chromium/interfaces");
}

console.log("Building for " + target + "...\n");

export default {
  entry: {
    background: "./src/shared/backgroundScripts/background.js",
    welcomePage: "./src/shared/pages/welcomePage/script.js",
  },
  output: {
    path: path.resolve("build"),
    filename: ({ chunk }) => {
      if (chunk.name === "background") {
        return target + "/background.bundle.js";
      } else if (chunk.name === "welcomePage") {
        return target + "/shared/pages/welcomePage/script.bundle.js";
      }
    },
  },
  resolve: {
    alias: alias,
  },
  mode: "development",
  devtool: "inline-source-map",
  plugins: [
    new webpack.DefinePlugin({
      IS_FIREFOX_EXTENSION: JSON.stringify(isFirefoxExtension),
      IS_CHROMIUM_EXTENSION: JSON.stringify(isChromiumExtension),
      TARGET_IMPORT_PATH: JSON.stringify(target),
    }),
    new CopyPlugin({
      patterns: copyPluginPatterns,
    }),
  ],
};
