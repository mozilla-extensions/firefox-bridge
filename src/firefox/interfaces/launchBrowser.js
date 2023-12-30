import { isCurrentTabValidUrlScheme } from "../../shared/backgroundScripts/validTab.js";
import { getExternalBrowserLaunchProtocol } from "./getters.js";

export async function launchBrowser(tab) {
  if (isCurrentTabValidUrlScheme) {
    const launchProtocol = await getExternalBrowserLaunchProtocol();
    if (launchProtocol) {
      browser.experiments.firefox_launch.launchApp(launchProtocol, [tab.url]);
      return true;
    } else {
      chrome.tabs.create({ url: chrome.runtime.getURL("pages/welcomePage/index.html") });
    }
  }
  return false;
}