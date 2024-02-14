import { getExternalBrowser } from "../../backgroundScripts/getters.js";
import * as settingEvent from "../../generated/settingEvent.js";
import { checkFirefoxHotkeys } from "./script.js";

/**
 * Populate the browser list with the available browsers.
 */
export async function populateBrowserList() {
  let browserList = document.getElementById("browser-select");
  browserList.innerHTML = "";

  const availableBrowsers =
    await browser.experiments.firefox_launch.getAvailableBrowsers();

  // if no browsers are available, remove the browser-list element and display a message
  if (availableBrowsers.length === 0) {
    document.getElementById("browser-list-container").remove();
    document.getElementById("error-notification").style.display = "flex";
    document.getElementById("shortcuts-list").remove();
    return;
  }

  const defaultBrowserName =
    await browser.experiments.firefox_launch.getDefaultBrowser();

  // sort the browsers and remove duplicates
  const browsers = [...new Set(availableBrowsers)].sort();

  // add browsers to the list
  browsers.forEach((localBrowser) => {
    const option = document.createElement("option");
    option.value = localBrowser;

    // if it's the user's default browser, add a message to the option
    const isDefaultBrowser = defaultBrowserName === localBrowser;
    if (isDefaultBrowser) {
      option.text = `${localBrowser} ${browser.i18n.getMessage(
        "welcomePageDefaultBrowser",
      )}`;
    } else {
      option.text = localBrowser;
    }
    browserList.appendChild(option);
  });

  // On change, update the current external browser.
  browserList.addEventListener("change", async (event) => {
    const oldBrowserName = await getExternalBrowser();
    const newBrowserName = event.target.value;

    browser.storage.sync.set({ currentExternalBrowser: newBrowserName });

    settingEvent.currentBrowser.record({
      from: oldBrowserName,
      to: newBrowserName,
      source: "browser_list",
    });

    const shortcutsList = document.getElementById("shortcuts-list");
    shortcutsList.innerHTML = "";
    await checkFirefoxHotkeys();
  });

  // Now select the proper browser.

  // In order of priority:
  // Select the current browser.
  // Select the default browser.
  // Select Safari on Mac and Edge on Windows.
  // Select the first browser in the list.
  // If there are no browsers, remove the list and display a message.
  const platform = (await browser.runtime.getPlatformInfo()).os;
  const currentBrowser = await getExternalBrowser();

  if (currentBrowser !== "Firefox") {
    browserList.value = currentBrowser;
  } else if (defaultBrowserName) {
    browserList.value = defaultBrowserName;
    browserList.dispatchEvent(new Event("change"));
  } else if (platform === "mac" && browsers.includes("Safari")) {
    browserList.value = "Safari";
    browserList.dispatchEvent(new Event("change"));
  } else if (platform === "win" && browsers.includes("Edge")) {
    browserList.value = "Edge";
    browserList.dispatchEvent(new Event("change"));
  } else if (browsers.length) {
    browserList.value = browsers[0];
    browserList.dispatchEvent(new Event("change"));
  } else {
    browserList.remove();
    document.getElementById("browser-list-message").innerText =
      "No browsers found.";
  }
}
