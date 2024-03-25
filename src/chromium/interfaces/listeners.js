import { launchBrowser } from "./launchBrowser.js";
import { getExternalBrowser } from "Shared/backgroundScripts/getters.js";
import * as launchEvent from "Shared/generated/launchEvent.js";

function registerEventRules() {
  if (registerEventRules.hasRunOnce) {
    return;
  }
  registerEventRules.hasRunOnce = true;

  const rule = {
    conditions: [
      new browser.declarativeContent.PageStateMatcher({
        pageUrl: { schemes: ["http", "https", "file"] },
      }),
    ],
    actions: [new browser.declarativeContent.ShowAction()],
  };

  browser.declarativeContent.onPageChanged.removeRules(undefined, () => {
    browser.declarativeContent.onPageChanged.addRules([rule], () => {
      browser.action.disable();
    });
  });
}

/**
 * Initialize the chromium specific listeners.
 */
export function initPlatformListeners() {
  browser.action.onClicked.addListener(async (tab) => {
    const browserName = await getExternalBrowser();
    const success = await launchBrowser(tab.url, browserName !== "Firefox");
    if (success) {
      launchEvent.browserLaunch.record({
        browser: await getExternalBrowser(),
        source: "action_button",
      });
    }
  });

  browser.runtime.onInstalled.addListener(async () => {
    registerEventRules();
  });
}
