import { launchBrowser } from "./launchBrowser.js";
import { getIsFirefoxInstalled } from "./getters.js";
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
    const success = launchBrowser(tab.url, browserName !== "Firefox");
    if (success) {
      launchEvent.browserLaunch.record({
        browser: await getExternalBrowser(),
        source: "action_button",
      });
    }
  });

  browser.runtime.onInstalled.addListener(async () => {
    registerEventRules();
    await getIsFirefoxInstalled();
    browser.storage.sync.set({ currentExternalBrowser: "Firefox" });
  });

  // From: https://github.com/Rob--W/crxviewer/blob/942b02fa871ff4ef6a29cf18b266711725314e86/src/background.js#L325-L341

  //// Work-around for crbug.com/388231: onInstalled is not fired when the
  //// extension was disabled during an update.
  browser.runtime.onStartup.addListener(() => {
    registerEventRules();
  });

  //// Work-around for crbug.com/264963: onInstalled is not fired when the
  //// extension is run in incognito mode. Although not documented, incognito
  //// contexts have their own declarativeContent rule store.
  if (browser.extension.inIncognitoContext) {
    browser.declarativeContent.onPageChanged.getRules(function (rules) {
      if (!rules.length) {
        registerEventRules();
      }
    });
  }
}
