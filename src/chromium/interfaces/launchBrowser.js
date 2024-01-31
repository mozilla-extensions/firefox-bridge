import { getIsFirefoxInstalled } from "./getters.js";
import { isCurrentTabValidUrlScheme } from "Shared/backgroundScripts/validTab.js";

/**
 * Launches the Firefox variant. If Firefox is not installed, launch the Firefox download page.
 *
 * @param {*} tab The tab object to launch the browser with.
 * @param {boolean} usePrivateBrowsing  True if firefox should be launched in private browsing mode, false for normal mode.
 * @returns {boolean} True if the browser was launched, false otherwise.
 */
export async function launchBrowser(tab, usePrivateBrowsing = false) {
  if (!(await getIsFirefoxInstalled())) {
    browser.tabs.create({ url: "https://www.mozilla.org/firefox/" });
    return false;
  }

  if (isCurrentTabValidUrlScheme) {
    if (usePrivateBrowsing) {
      browser.tabs.update(tab.id, { url: "firefox-private:" + tab.url });
    } else {
      browser.tabs.update(tab.id, { url: "firefox:" + tab.url });
    }
    return true;
  }
  return false;
}
