import { launchBrowser } from "./launchBrowser.js";
import { getIsFirefoxInstalled } from "./getters.js";

import { getExternalBrowser } from "../../shared/backgroundScripts/getters.js";

export function initPlatformListeners() {
  chrome.action.onClicked.addListener(async (tab) => {
    const success = launchBrowser(
      tab,
      (await getExternalBrowser()) === "Firefox"
    );

    if (success) {
      chrome.storage.local.set({
        telemetry: {
          type: "browserLaunch",
          browser: await getExternalBrowser(),
          source: "action_button",
        },
      });
    }
  });

  chrome.runtime.onInstalled.addListener(async () => {
    await getIsFirefoxInstalled();
  });
}
