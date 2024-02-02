import { launchBrowser } from "./launchBrowser.js";
import { getExternalBrowser } from "Shared/backgroundScripts/getters.js";
import * as launchEvent from "Shared/generated/launchEvent.js";

/**
 * Initialize the firefox specific listeners.
 */
export function initPlatformListeners() {
  browser.action.onClicked.addListener(async (tab) => {
    if (await launchBrowser(tab)) {
      launchEvent.browserLaunch.record({
        browser: await getExternalBrowser(),
        source: "action_button",
      });
    }
  });
}
