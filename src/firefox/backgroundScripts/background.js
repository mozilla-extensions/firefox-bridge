import { testShared } from "../../shared/testshared.js";

browser.runtime.onInstalled.addListener(() => {
  console.log("onInstalled...");
  testShared();
});