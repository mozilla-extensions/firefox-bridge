import { launchBrowser } from "./launchBrowser.js";
import { getIsFirefoxInstalled } from "./getters.js";
import { getExternalBrowser } from "Shared/backgroundScripts/getters.js";
import * as launchEvent from "Shared/generated/launchEvent.js";

/**
 * Initialize the chromium specific listeners.
 */
export function initPlatformListeners() {
  browser.action.onClicked.addListener(async (tab) => {
    const browserName = await getExternalBrowser();
    const success = launchBrowser(tab, browserName !== "Firefox");
    if (success) {
      launchEvent.browserLaunch.record({
        browser: await getExternalBrowser(),
        source: "action_button",
      });
    }
  });

  browser.runtime.onInstalled.addListener(async () => {
    await getIsFirefoxInstalled();
    browser.storage.sync.set({ currentExternalBrowser: "Firefox" });
  });
}
