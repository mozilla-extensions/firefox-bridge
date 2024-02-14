import { launchBrowser } from "Interfaces/launchBrowser.js";
import { getExternalBrowser } from "./getters.js";
import * as launchEvent from "Shared/generated/launchEvent.js";

/**
 * Launches the user set browser on hotkey press.
 *
 * @param {string} command The command to execute found in the manifest.
 * @param {*} tab The tab object to launch the browser with.
 */
export async function handleHotkeyPress(command, tab) {
  if (command === "launchBrowser") {
    if (await launchBrowser(tab.url)) {
      launchEvent.browserLaunch.record({
        browser: await getExternalBrowser(),
        source: "hotkey",
      });
    }
  } else if (command === "launchFirefoxPrivate") {
    if (await launchBrowser(tab.url, true)) {
      launchEvent.browserLaunch.record({
        browser: "Firefox Private Browsing",
        source: "hotkey",
      });
    }
  }
}
