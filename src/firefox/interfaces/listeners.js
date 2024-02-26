import { launchBrowser } from "./launchBrowser.js";
import { getExternalBrowser } from "Shared/backgroundScripts/getters.js";
import * as launchEvent from "Shared/generated/launchEvent.js";
import { isURLValid } from "Shared/backgroundScripts/validTab.js";

/**
 * Initialize the firefox specific listeners.
 */
export function initPlatformListeners() {
  browser.action.onClicked.addListener(async (tab) => {
    if (await launchBrowser(tab.url)) {
      launchEvent.browserLaunch.record({
        browser: await getExternalBrowser(),
        source: "action_button",
      });
    }
  });

  // make the default state disabled, then enable if the tab is valid
  browser.tabs.query({}).then(async (tabs) => {
    await browser.action.disable();
    for (const tab of tabs) {
      if (isURLValid(tab.url)) {
        browser.action.enable(tab.id);
      }
    }
  });

  // Update the toolbar icon when the tab is changed
  browser.webNavigation.onCommitted.addListener(
    async (details) => {
      if (details.frameId === 0) {
        await browser.action.enable(details.tabId);
      }
    },
    {
      url: [
        {
          schemes: ["http", "https", "file"],
        },
      ],
    },
  );
}
