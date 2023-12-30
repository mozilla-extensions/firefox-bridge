import { launchBrowser } from "./launchBrowser.js";

export function initPlatformListeners() {

  chrome.action.onClicked.addListener(async (tab) => {
    launchBrowser(tab);

  });

}