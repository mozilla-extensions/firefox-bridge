import {
  getExternalBrowser,
  getTelemetryEnabled,
} from "../../backgroundScripts/getters.js";

const isChromium = chrome.runtime.getManifest().minimum_chrome_version;

/**
 * Populate the browser list with the available browsers.
 */
async function populateBrowserList() {
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
        ? `${browser.name} (Default Browser)`
        : browser.name;
    option.setAttribute("data-launch-protocol", browser.executable);
    browserList.appendChild(option);
  });

  // On change, update the current external browser.
  browserList.addEventListener("change", async (event) => {
    const browserName = event.target.value;
    const executable = event.target.selectedOptions[0].getAttribute(
      "data-launch-protocol"
    );
    console.log(`Selected browser: ${browserName}`);
    console.log(`Selected browser executable: ${executable}`);

    chrome.storage.local.set({
      telemetry: {
        type: "currentBrowserChange",
        from: await getExternalBrowser(),
        to: browserName,
      },
    });
    chrome.storage.local.set({
      currentExternalBrowserLaunchProtocol: executable,
    });
    chrome.storage.sync.set({ currentExternalBrowser: browserName });
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

/**
 * Update the telemetry checkbox and initialize the listener.
 */
async function updateTelemetry() {
  // check storage to see if telemetry is enabled/disabled. If neither, set to true.
  const telemetryEnabled = await getTelemetryEnabled();
  chrome.storage.sync.set({ telemetryEnabled });
  document.getElementById("telemetry-checkbox").checked = telemetryEnabled;

  document
    .getElementById("telemetry-checkbox")
    .addEventListener("change", async () => {
      const telemetryEnabled = await getTelemetryEnabled();
      chrome.storage.sync.set({ telemetryEnabled: !telemetryEnabled });
    });
}

/**
 * Check the hotkeys for the browser launch and let the user know if
 * they are not set.
 */
async function checkFirefoxHotkeys() {
  // get hotkeys with id launchBrowser
  const hotkeys = await chrome.commands.getAll();
  const launchBrowser = hotkeys.find(
    (hotkey) => hotkey.name === "launchBrowser"
  );

  const shortcutsList = document.getElementById("shortcuts-list");

  if (launchBrowser.shortcut) {
    const launchBrowserHotkey = launchBrowser.shortcut;

    // convert Ctrl to Cmd on Mac
    let hotkey = launchBrowserHotkey.split("+");
    if (
      hotkey.includes("Ctrl") &&
      (await chrome.runtime.getPlatformInfo()).os === "mac"
    ) {
      hotkey[hotkey.indexOf("Ctrl")] = "Cmd";
    }
    hotkey = hotkey.join("+");

    const p = document.createElement("p");
    p.innerText = chrome.i18n.getMessage("welcomePageYesShortcutTo", [
      hotkey.toUpperCase(),
      await getExternalBrowser(),
    ]);
    shortcutsList.appendChild(p);
  } else {
    const preamble = document.getElementById("shortcuts-instruction-preamble");
    preamble.innerText = chrome.i18n.getMessage("welcomePageNoShortcuts");
  }
}

/**
 * Check the hotkeys for the browser launch and let the user know if
 * they are not set.
 *
 * Also add a link to the chromium shortcuts page.
 */
export async function checkChromiumHotkeys() {
  const hotkeys = await chrome.commands.getAll();
  const launchBrowser = hotkeys.find(
    (hotkey) => hotkey.name === "launchBrowser"
  );
  const launchFirefoxPrivate = hotkeys.find(
    (hotkey) => hotkey.name === "launchFirefoxPrivate"
  );

  const shortcutsList = document.getElementById("shortcuts-list");

  // if there are no shortcuts, display a message
  if (!launchBrowser.shortcut && !launchFirefoxPrivate.shortcut) {
    const preamble = document.createElement("p");
    preamble.innerText = chrome.i18n.getMessage("welcomePageNoShortcuts");
    shortcutsList.appendChild(preamble);
    return;
  }

  // Display a message for each shortcut whether it is set or not
  const span = document.createElement("span");
  span.classList.add("shortcut-item");
  if (launchBrowser.shortcut) {
    const launchBrowserHotkey = launchBrowser.shortcut;
    span.innerText =
      chrome.i18n.getMessage("welcomePageYesShortcutTo", [
        launchBrowserHotkey.toUpperCase(),
        await getExternalBrowser(),
      ]) + "\n";
  } else {
    span.innerText =
      chrome.i18n.getMessage("welcomePageNoShortcutTo", ["Firefox"]) + "\n";
  }
  shortcutsList.appendChild(span);

  const span2 = document.createElement("span");
  span2.classList.add("shortcut-item");
  if (launchFirefoxPrivate.shortcut) {
    const launchFirefoxPrivateHotkey = launchFirefoxPrivate.shortcut;
    span2.innerText =
      chrome.i18n.getMessage("welcomePageYesShortcutTo", [
        launchFirefoxPrivateHotkey.toUpperCase(),
        await getExternalBrowser(),
      ]) + "\n";
  } else {
    span2.innerText =
      chrome.i18n.getMessage("welcomePageNoShortcutTo", [
        "Firefox private browsing",
      ]) + "\n";
  }
  shortcutsList.appendChild(span2);
}

/**
 * Check the private browsing checkbox if the current external browser is
 * Firefox Private Browsing. Add a listener to update the default launch mode.
 */
export async function checkPrivateBrowsing() {
  const alwaysPrivateCheckbox = document.getElementById(
    "always-private-checkbox"
  );
  const currentExternalBrowser = await getExternalBrowser();
  if (currentExternalBrowser === "Firefox Private Browsing") {
    alwaysPrivateCheckbox.checked = true;
  } else {
    alwaysPrivateCheckbox.checked = false;
  }

  // On change, update the default launch mode
  alwaysPrivateCheckbox.addEventListener("change", async () => {
    if (alwaysPrivateCheckbox.checked) {
      chrome.storage.sync.set({
        currentExternalBrowser: "Firefox Private Browsing",
      });
    } else {
      chrome.storage.sync.set({ currentExternalBrowser: "Firefox" });
    }
  });
}

export function replaceDataLocale(id, href = "") {
  const element = document.querySelector(`[data-locale="${id}"]`);
  let message = chrome.i18n.getMessage(id);
  message = message.replace("{LinkStart}", `<a id="${id}Link" href="">`);
  message = message.replace("{LinkEnd}", "</a>");
  element.innerHTML = message;

  if (href) {
    // since some links like chrome://extensions/shortcuts are not valid urls, we need to add a listener to open them
    const link = document.getElementById(`${id}Link`);
    link.addEventListener("click", (event) => {
      event.preventDefault();
      chrome.tabs.create({
        url: href,
      });
    });
  }
}

export function applyLocalization() {
  if (isChromium) {
    replaceDataLocale("welcomePageTitleChromium");
    replaceDataLocale("welcomePageSubtitleChromium");
    replaceDataLocale("welcomePageDescriptionChromium");
    replaceDataLocale("welcomePageAlwaysPrivateCheckboxChromium");
    replaceDataLocale(
      "welcomePageManageShortcutsChromium",
      "chrome://extensions/shortcuts"
    );
    replaceDataLocale("welcomePageTryChromium");
  } else {
    replaceDataLocale("welcomePageTitleFirefox");
    replaceDataLocale("welcomePageSubtitleFirefox");
    replaceDataLocale("welcomePageDescriptionFirefox");
    replaceDataLocale("welcomePageBrowserSelectorFirefox");
    replaceDataLocale("welcomePageManageShortcutsFirefox", "about:addons");
    replaceDataLocale("welcomePageTryFirefox");
  }
  replaceDataLocale("welcomePageTelemetryCheckbox");
  replaceDataLocale("welcomePageShortcutTitle");
}

export async function activatePlatformSpecificElements() {
  if (isChromium) {
    // remove objects with class firefox from the page
    const firefoxElements = document.getElementsByClassName("firefox");
    const firefoxElementsArray = Array.from(firefoxElements);
    firefoxElementsArray.forEach((element) => {
      element.remove();
    });
    checkChromiumHotkeys();
    checkPrivateBrowsing();
  } else {
    // remove objects with class chromium
    const chromiumElements = document.getElementsByClassName("chromium");
    const chromiumElementsArray = Array.from(chromiumElements);
    chromiumElementsArray.forEach((element) => {
      element.remove();
    });
    populateBrowserList();
    checkFirefoxHotkeys();
  }
}

document.addEventListener("DOMContentLoaded", async function() {
  await activatePlatformSpecificElements();
  applyLocalization();
  updateTelemetry();
});
