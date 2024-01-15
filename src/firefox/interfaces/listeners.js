import { launchBrowser } from "./launchBrowser.js";
import { getExternalBrowser } from "../../shared/backgroundScripts/getters.js";

/**
 * Initialize the firefox specific listeners.
 */
export function initPlatformListeners() {
  chrome.action.onClicked.addListener(async (tab) => {
    if (launchBrowser(tab)) {
      chrome.storage.local.set({
        telemetry: {
          type: "browserLaunch",
          browser: await getExternalBrowser(),
          source: "action_button",
        },
      });
    }
  });
}
