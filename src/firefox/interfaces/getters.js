import { getExternalBrowser } from "../../shared/backgroundScripts/getters.js";

/**
 * Retrieve the non-greyed icon path for the current browser. If the browser is not
 * supported, return the extension icon path.
 *
 * @returns {Promise<string>} The non-greyed icon path.
 */
export async function getDefaultIconPath() {
  const browserName = (await getExternalBrowser()).toLowerCase();
  if (!browserName) {
    return { 32: chrome.runtime.getURL("images/firefox-launch/32.png") };
  }
  return { 32: chrome.runtime.getURL(`images/${browserName}/32.png`) };
}

/**
 * Retrieve the greyed icon path for the current browser. If the browser is not
 * supported, return the extension icon path.
 *
 * @returns {Promise<string>} The greyed icon path.
 */
export async function getGreyedIconPath() {
  const browserName = (await getExternalBrowser()).toLowerCase();
  if (!browserName) {
    return { 32: chrome.runtime.getURL("images/firefox-launch/32.png") };
  }
  return { 32: chrome.runtime.getURL(`images/${browserName}/32grey.png`) };
}

/**
 * Retrieve the current browser launch protocol from storage. If the browser is not
 * set, return an empty string.
 * 
 * @returns {Promise<string>} The current browser launch protocol.
 */
export function getExternalBrowserLaunchProtocol() {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ["currentExternalBrowserLaunchProtocol"],
      (result) => {
        if (
          !result ||
          result.currentExternalBrowserLaunchProtocol === undefined
        ) {
          resolve("");
        } else {
          resolve(result.currentExternalBrowserLaunchProtocol);
        }
      }
    );
  });
}
