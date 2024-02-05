import { getExternalBrowser } from "Shared/backgroundScripts/getters.js";

/**
 * Determines whether Firefox is installed on the system.
 *
 * @returns {Promise<boolean>} True if Firefox is installed on the system, false otherwise.
 */
export async function getIsFirefoxInstalled() {
  // NOTE: We are not currently handling the case where Firefox is not installed until
  // native messaging is implemented. We will assume for now that Firefox is always installed.
  const result = await browser.storage.session.get("isFirefoxInstalled");
  if (result.isFirefoxInstalled === undefined) {
    browser.storage.session.set({ isFirefoxInstalled: true });
    return true;
  }
  return result.isFirefoxInstalled;
}

/**
 * Get the non-greyed icon path for Firefox or Firefox Private.
 *
 * @returns {Promise<string>} The path to the non-greyed icon.
 */
export async function getDefaultIconPath() {
  if ((await getExternalBrowser()) === "Firefox") {
    return {
      32: browser.runtime.getURL("images/firefox/firefox32.png"),
    };
  }
  return {
    32: browser.runtime.getURL("images/firefox-private/private32.png"),
  };
}

/**
 * Get the greyed icon path for Firefox or Firefox Private.
 *
 * @returns {Promise<string>} The path to the greyed icon.
 */
export async function getGreyedIconPath() {
  if ((await getExternalBrowser()) === "Firefox") {
    return {
      32: browser.runtime.getURL("images/firefox/firefox32grey.png"),
    };
  }
  return {
    32: browser.runtime.getURL("images/firefox-private/private32grey.png"),
  };
}
