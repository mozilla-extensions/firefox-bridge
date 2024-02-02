import { isCurrentTabValidUrlScheme } from "Shared/backgroundScripts/validTab.js";
import { getExternalBrowserLaunchProtocol } from "./getters.js";

/**
 * Launches the user set browser. If the browser is not set, launch the welcome page.
 *
 * @param {*} url The url to launch in the browser.
 * @returns {boolean} True if the browser was launched, false otherwise.
 */
export async function launchBrowser(url) {
  if (isCurrentTabValidUrlScheme) {
    const launchProtocol = await getExternalBrowserLaunchProtocol();
    if (launchProtocol) {
      browser.experiments.firefox_launch.launchApp(launchProtocol, [url]);
      return true;
    }
    browser.tabs.create({
      url: browser.runtime.getURL("shared/pages/welcomePage/index.html"),
    });
  }
  return false;
}
