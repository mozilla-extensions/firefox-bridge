import {
  getExternalBrowser,
} from "../../backgroundScripts/getters.js";

/**
 * Populate the browser list with the available browsers.
 */
export async function populateBrowserList() {
  let browserList = document.getElementById("browser-select");
  browserList.innerHTML = "";

  const availableBrowsers = await browser.experiments.firefox_launch.getAvailableBrowsers();
  console.group("Experimental Api Logs");
  availableBrowsers.logs.forEach((log) => {
    console.log(log);
  });
  console.groupEnd();

  // sort browsers by name alphabetically and remove duplicate names
  const loadedBrowsers = new Set();
  const browsers = availableBrowsers.browsers
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((browser) => {
      if (loadedBrowsers.has(browser.name)) {
        return false;
      } else {
        loadedBrowsers.add(browser.name);
        return true;
      }
    });

  const defaultBrowserName = await browser.experiments.firefox_launch
    .getDefaultBrowser()
    .then((browser) => browser.name);

  // add browsers to the list
  browsers.forEach((browser) => {
    const option = document.createElement("option");
    option.value = browser.name;
    option.text =
      defaultBrowserName === browser.name
        ? `${browser.name} ${chrome.i18n.getMessage(
          "welcomePageDefaultBrowser"
        )}`
        : browser.name;
    option.setAttribute("data-launch-protocol", browser.executable);
    browserList.appendChild(option);
  });

  // On change, update the current external browser.
  browserList.addEventListener("change", async (event) => {
    const oldBrowserName = await getExternalBrowser();
    const newBrowserName = event.target.value;
    const executable = event.target.selectedOptions[0].getAttribute(
      "data-launch-protocol"
    );

    // update launch-browser-shortcut
    const launchBrowserShortcutElement = document.getElementById(
      "launch-browser-shortcut"
    );
    launchBrowserShortcutElement.innerText = launchBrowserShortcutElement.innerText.replace(
      oldBrowserName,
      newBrowserName
    );
    
    chrome.storage.local.set({
      currentExternalBrowserLaunchProtocol: executable,
    });
    chrome.storage.sync.set({ currentExternalBrowser: newBrowserName });

    chrome.storage.local.set({
      telemetry: {
        type: "currentBrowserChange",
        from: oldBrowserName,
        to: newBrowserName,
      },
    });
  });

  // Now select the proper browser.
  // if there is no current browser set, select the default browser in the list. Otherwise, select the first browser in the list.
  // otherwise select the current browser. If there are no browsers in the list, remove the browser-list element and display a message.
  const currentBrowser = await getExternalBrowser();
  if (currentBrowser) {
    browserList.value = currentBrowser;
  } else if (defaultBrowserName) {
    browserList.value = defaultBrowserName;
    browserList.dispatchEvent(new Event("change"));
  } else if (browsers.length > 0) {
    browserList.value = browsers[0].name;
    browserList.dispatchEvent(new Event("change"));
  } else {
    browserList.remove();
    document.getElementById("browser-list-message").innerText =
      "No browsers found.";
  }
}
