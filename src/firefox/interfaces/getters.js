import { getExternalBrowser } from "Shared/backgroundScripts/getters.js";

/**
 * Retrieve the non-greyed icon path for the current browser. If the browser is not
 * supported, return the extension icon path.
 *
 * @returns {Promise<string>} The non-greyed icon path.
 */
export async function getDefaultIconPath() {
  const browserName = (await getExternalBrowser()).toLowerCase();
  if (!browserName) {
    return { 32: browser.runtime.getURL("images/firefox-launch/32.png") };
  }
  return { 32: browser.runtime.getURL(`images/${browserName}/32.png`) };
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
    return { 32: browser.runtime.getURL("images/firefox-launch/32.png") };
  }
  return { 32: browser.runtime.getURL(`images/${browserName}/32grey.png`) };
}

export function getIsFirefoxInstalled() {}
