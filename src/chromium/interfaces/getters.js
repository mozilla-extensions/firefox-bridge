import { getExternalBrowser } from "Shared/backgroundScripts/getters.js";

const nativeApps = [
  "org.mozilla.firefox_bridge_nmh_dev",
  "org.mozilla.firefox_bridge_nmh_nightly",
  "org.mozilla.firefox_bridge_nmh",
  "org.mozilla.firefox_bridge_nmh_esr",
];

/**
 * Determines whether Firefox is installed on the system and returns the name of the installed Firefox variant in
 * order of preference: dev, nightly, release, esr.
 *
 * @returns {Promise<string>} The name of the installed Firefox variant, or undefined if a Firefox variant is not installed.
 */
export async function getInstalledFirefoxVariant() {
  // Check for installed variants using the respective native messaging host.
  for (const nativeApp of nativeApps) {
    try {
      await browser.runtime.sendNativeMessage(nativeApp, {
        command: "GetVersion",
      });
      return nativeApp;
    } catch (error) {}
  }
  return undefined;
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
