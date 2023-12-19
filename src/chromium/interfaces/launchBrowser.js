import { getIsFirefoxInstalled } from "./getters.js";

import { isCurrentTabValidUrlScheme } from "../../shared/backgroundScripts/validTab.js";

export async function launchBrowser(tab, launchDefaultBrowsing) {
  if (!(await getIsFirefoxInstalled())) {
    chrome.tabs.create({ url: "https://www.mozilla.org/firefox/" });
    return false;
  }

  if (isCurrentTabValidUrlScheme) {
    if (launchDefaultBrowsing) {
      chrome.tabs.update(tab.id, { url: "firefox:" + tab.url });
    } else {
      chrome.tabs.update(tab.id, { url: "firefox-private:" + tab.url });
    }
    return true;
  }
  return false;
}