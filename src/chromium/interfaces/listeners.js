import { launchBrowser } from "./launchBrowser.js";
import { getIsFirefoxDefault, getIsFirefoxInstalled } from "./getIcon.js";


export function initPlatformListeners() {
  chrome.action.onClicked.addListener(async (tab) => {
    launchBrowser(tab, await getIsFirefoxDefault());
  });

  chrome.runtime.onInstalled.addListener(async () => {
    await getIsFirefoxInstalled();
  });
}