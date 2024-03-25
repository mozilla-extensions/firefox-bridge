import { isURLValid } from "Shared/backgroundScripts/validTab.js";
import { getInstalledFirefoxVariant } from "./getters.js";
import { failedBrowserLaunch } from "Shared/generated/launchEvent.js";

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
    // No Firefox variant is installed. Direct the user to the welcome page.
    await browser.tabs.create({
      url: browser.runtime.getURL("shared/pages/welcomePage/index.html"),
    });
    return false;
  }

  // Launch the first installed firefox variant of dev, nightly, release, or esr.
  const command = usePrivateBrowsing ? "LaunchFirefoxPrivate" : "LaunchFirefox";
  try {
    const response = await browser.runtime.sendNativeMessage(
      nativeMessagingHost,
      {
        command,
        data: { url },
      },
    );

    if (response.result_code !== 0) {
      // NMH failure.
      failedBrowserLaunch.record({
        command,
        native_messaging_host: nativeMessagingHost,
        message: response.message,
      });
      throw new Error(response.message);
    }
    return true;
  } catch (error) {
    // Should not occur as nativeMessagingHost is checked for validity.
    console.error(
      `Error attempting to launch Firefox with ${nativeMessagingHost}:`,
      error.message,
    );
  }

  return false;
}
