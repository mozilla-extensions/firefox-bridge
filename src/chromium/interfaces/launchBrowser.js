import { getIsFirefoxInstalled } from "./getters.js";

/**
 * Launches the Firefox variant. If Firefox is not installed, launch the Firefox download page.
 *
 * @param {string} url The url to launch in the browser.
 * @param {boolean} usePrivateBrowsing  True if firefox should be launched in private browsing mode, false for normal mode.
 * @returns {boolean} True if the browser was launched, false otherwise.
 */
export async function launchBrowser(url, usePrivateBrowsing = false) {
  if (
    url &&
    !url.startsWith("https:") &&
    !url.startsWith("http:") &&
    !url.startsWith("file:")
  ) {
    console.error("Invalid URL scheme:", url);
    return false;
  }

  if (!(await getIsFirefoxInstalled())) {
    browser.tabs.create({ url: "https://www.mozilla.org/firefox/" });
    return false;
  }

  const currentTab = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const currentTabId = currentTab[0].id;
  if (usePrivateBrowsing) {
    browser.tabs.update(currentTabId, { url: "firefox-private:" + url });
  } else {
    browser.tabs.update(currentTabId, { url: "firefox:" + url });
  }
  return true;
}
