import { launchBrowser } from "./launchBrowser.js";
import { getExternalBrowser } from "Shared/backgroundScripts/getters.js";

/**
 * Initialize the firefox specific listeners.
 */
export function initPlatformListeners() {
  browser.action.onClicked.addListener(async (tab) => {
    if (await launchBrowser(tab.url)) {
      browser.storage.local.set({
        telemetry: {
          type: "browserLaunch",
          browser: await getExternalBrowser(),
          source: "action_button",
        },
      });
    }
  });
}
