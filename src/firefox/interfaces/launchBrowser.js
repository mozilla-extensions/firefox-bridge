import { getExternalBrowser } from "Shared/backgroundScripts/getters.js";
import { isURLValid } from "Shared/backgroundScripts/validTab.js";

/**
 * Launches the user set browser. If the browser is not set, launch the welcome page.
 *
 * @param {string} url The url to launch in the browser.
 * @param {boolean} usePrivateBrowsing True if the browser should be launched in private browsing mode, false for normal mode.
 * @returns {boolean} True if the browser was launched, false otherwise.
 */
export async function launchBrowser(url, usePrivateBrowsing = false) {
  if (usePrivateBrowsing) {
    // NOTE: an argument of --incognito in the launchApp call would launch the browser in private mode in chromium.
    console.error(
      "Private browsing launching is not yet supported from Firefox.",
    );
    return false;
  }

  if (!isURLValid(url)) {
    console.error("Invalid URL scheme:", url);
    return false;
  }

  const externalBrowser = await getExternalBrowser();
  if (!externalBrowser) {
    browser.tabs.create({
      url: browser.runtime.getURL("shared/pages/welcomePage/index.html"),
    });
    return false;
  }
  browser.experiments.firefox_bridge.launchBrowser(externalBrowser, url);
  return true;
}
