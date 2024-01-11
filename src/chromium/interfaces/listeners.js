import { launchBrowser } from "./launchBrowser.js";
import { getIsFirefoxInstalled } from "./getters.js";
import { getExternalBrowser } from "../../shared/backgroundScripts/getters.js";

/**
 * Initialize the chromium specific listeners.
 */
export function initPlatformListeners() {
  chrome.action.onClicked.addListener(async (tab) => {
    const browserName = await getExternalBrowser();
    const success = launchBrowser(
      tab,
      browserName === "Firefox"
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
