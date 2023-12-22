import { launchBrowser } from "./launchBrowser.js";

export function initPlatformListeners() {

  chrome.action.onClicked.addListener(async (tab) => {
    launchBrowser(tab);
  });

  chrome.runtime.onInstalled.addListener(async () => {
    await getIsFirefoxInstalled();
    if (!(await getExternalBrowser())) {
      chrome.storage.local.set({ currentExternalBrowser: "Firefox" });
    }
  });

}