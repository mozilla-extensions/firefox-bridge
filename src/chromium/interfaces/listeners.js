import { launchBrowser } from "./launchBrowser.js";
import { getIsFirefoxInstalled } from "./getters.js";

import { getExternalBrowser } from "../../shared/backgroundScripts/getters.js";

export function initPlatformListeners() {
  chrome.action.onClicked.addListener(async (tab) => {
    launchBrowser(tab, (await getExternalBrowser()) === "Firefox");
  });

  chrome.runtime.onInstalled.addListener(async () => {
    await getIsFirefoxInstalled();
    if (!(await getExternalBrowser())) {
      chrome.storage.local.set({ currentExternalBrowser: "Firefox" });
    }
  });
}
