export default {
  presets: [["@babel/preset-env", { targets: { node: "current" } }]],
  plugins: [
    [
      "module-resolver",
      {
        alias: {
          Shared: "./src/shared",
          Interfaces: "./src/chromium/interfaces",
        },
      },
    ],
  ],
};
