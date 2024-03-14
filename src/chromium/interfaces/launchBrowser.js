import { isURLValid } from "Shared/backgroundScripts/validTab.js";
import { getInstalledFirefoxVariant } from "./getters.js";

/**
 * Launches the Firefox variant. If Firefox is not installed, launch the Firefox download page.
 *
 * @param {string} url The url to launch in the browser.
 * @param {boolean} usePrivateBrowsing True if firefox should be launched in private browsing mode, false for normal mode.
 * @returns {Promise<boolean>} A promise that resolves to true if the browser was launched, false otherwise.
 */
export async function launchBrowser(url, usePrivateBrowsing = false) {
  if (!isURLValid(url)) {
    console.error("Invalid URL scheme:", url);
    return false;
  }

  const nativeMessagingHost = await getInstalledFirefoxVariant();
  if (!nativeMessagingHost) {
    // No Firefox variant is installed. Direct the user to the Firefox download page.
    await browser.tabs.create({
      url: "https://www.mozilla.org/firefox/new/",
    });
    return false;
  }

  // Launch the first installed firefox variant of dev, nightly, release, or esr.
  try {
    const command = usePrivateBrowsing
      ? "LaunchFirefoxPrivate"
      : "LaunchFirefox";
    const response = await browser.runtime.sendNativeMessage(
      nativeMessagingHost,
      {
        command,
        data: { url },
      },
    );

    if (response.result_code === 1) {
      throw new Error(response.message);
    }
    return true;
  } catch (error) {
    console.error(
      `Error attempting to launch Firefox with ${nativeMessagingHost}:`,
      error.message,
    );
  }

  return false;
}
