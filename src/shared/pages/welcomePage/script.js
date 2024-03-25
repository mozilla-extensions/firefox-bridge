import {
  getExternalBrowser,
  getTelemetryEnabled,
} from "../../backgroundScripts/getters.js";
import * as settingEvent from "../../generated/settingEvent.js";

import { applyLocalization, replaceMessage } from "./localization.js";
import { populateBrowserList } from "./browserList.js";
import { getInstalledFirefoxVariant } from "Interfaces/getters.js";
import { handleChangeDefaultLaunchContextMenuClick } from "Interfaces/contextMenus.js";

import "Shared/backgroundScripts/polyfill.js";
import { initGlean } from "Shared/backgroundScripts/telemetry.js";

/**
 * Check the private browsing checkbox if the current external browser is
 * Firefox Private Browsing. Add a listener to update the default launch mode.
 */
export async function checkPrivateBrowsing() {
  const alwaysPrivateCheckbox = document.getElementById(
    "always-private-checkbox",
  );

  alwaysPrivateCheckbox.checked =
    (await getExternalBrowser()) === "Firefox Private Browsing";

  browser.storage.sync.onChanged.addListener((changes) => {
    if (changes.currentExternalBrowser !== undefined) {
      alwaysPrivateCheckbox.checked =
        changes.currentExternalBrowser.newValue === "Firefox Private Browsing";
    }
  });

  alwaysPrivateCheckbox.addEventListener("change", async () => {
    let from = await getExternalBrowser();
    await handleChangeDefaultLaunchContextMenuClick();
    let to = await getExternalBrowser();

    settingEvent.currentBrowser.record({
      from,
      to,
      source: "always_private_checkbox",
    });
  });
}

/**
 * Update the telemetry checkbox and initialize the listener.
 */
export async function updateTelemetry() {
  // check storage to see if telemetry is enabled/disabled. If neither, false is default
  const telemetryCheckbox = document.getElementById("telemetry-checkbox");
  telemetryCheckbox.checked = await getTelemetryEnabled();

  telemetryCheckbox.addEventListener("change", function () {
    browser.storage.sync.set({ telemetryEnabled: telemetryCheckbox.checked });
  });

  browser.storage.sync.onChanged.addListener((changes) => {
    if (changes.telemetryEnabled !== undefined) {
      telemetryCheckbox.checked = changes.telemetryEnabled.newValue;
    }
  });
}

/**
 * Check the hotkeys for the browser launch and let the user know if
 * they are not set.
 */
export async function checkFirefoxHotkeys() {
  // get hotkeys with id launchBrowser
  const hotkeys = await browser.commands.getAll();
  const launchBrowser = hotkeys.find(
    (hotkey) => hotkey.name === "launchBrowser",
  );

  const shortcutsList = document.getElementById("shortcuts-list");

  const p = document.createElement("p");
  shortcutsList.appendChild(p);
  if (launchBrowser.shortcut) {
    let launchBrowserHotkey = launchBrowser.shortcut;

    // convert Ctrl to Cmd on Mac and command to cmd on Mac
    if ((await browser.runtime.getPlatformInfo()).os === "mac") {
      launchBrowserHotkey = launchBrowserHotkey.replace("Ctrl", "CMD");
      launchBrowserHotkey = launchBrowserHotkey.replace("Command", "CMD");
    }

    p.id = "launch-browser-shortcut";
    p.innerText = browser.i18n.getMessage("welcomePageYesShortcutTo", [
      launchBrowserHotkey.toUpperCase(),
      await getExternalBrowser(),
    ]);
  } else {
    replaceMessage(p, "welcomePageNoShortcutsFirefox");

    // remove the manage shortcuts text
    const manageShortcutsText = document.querySelector(
      "[data-locale='welcomePageManageShortcuts']",
    );
    manageShortcutsText?.remove();
  }
}

/**
 * Check the hotkeys for the browser launch and let the user know if
 * they are not set.
 *
 * Also add a link to the chromium shortcuts page.
 */
export async function checkChromiumHotkeys() {
  const hotkeys = await browser.commands.getAll();
  const launchBrowser = hotkeys.find(
    (hotkey) => hotkey.name === "launchBrowser",
  );
  const launchFirefoxPrivate = hotkeys.find(
    (hotkey) => hotkey.name === "launchFirefoxPrivate",
  );

  const shortcutsList = document.getElementById("shortcuts-list");

  // if there are no shortcuts, display a message
  if (!launchBrowser.shortcut && !launchFirefoxPrivate.shortcut) {
    const preamble = document.createElement("p");
    shortcutsList.appendChild(preamble);
    replaceMessage(preamble, "welcomePageNoShortcutsChromium");

    // remove the manage shortcuts text
    const manageShortcutsText = document.querySelector(
      "[data-locale='welcomePageManageShortcuts']",
    );
    manageShortcutsText?.remove();
    return;
  }

  // Display a message for the Firefox shortcut
  const span = document.createElement("span");
  span.classList.add("shortcut-item");
  if (launchBrowser.shortcut) {
    const launchBrowserHotkey = launchBrowser.shortcut;
    span.innerText =
      browser.i18n.getMessage("welcomePageYesShortcutTo", [
        launchBrowserHotkey.toUpperCase(),
        "Firefox",
      ]) + "\n";
  } else {
    span.innerText =
      browser.i18n.getMessage("welcomePageNoShortcutTo", ["Firefox"]) + "\n";
  }
  shortcutsList.appendChild(span);

  // Display a message for the Firefox private shortcut
  const span2 = document.createElement("span");
  span2.classList.add("shortcut-item");
  if (launchFirefoxPrivate.shortcut) {
    const launchFirefoxPrivateHotkey = launchFirefoxPrivate.shortcut;
    span2.innerText =
      browser.i18n.getMessage("welcomePageYesShortcutToFirefoxPrivate", [
        launchFirefoxPrivateHotkey.toUpperCase(),
      ]) + "\n";
  } else {
    span2.innerText =
      browser.i18n.getMessage("welcomePageNoShortcutToFirefoxPrivate") + "\n";
  }
  shortcutsList.appendChild(span2);
}

/**
 * Add or remove certain elements from the page depending on the platform.
 */
export async function activatePlatformSpecificElements() {
  if (IS_FIREFOX_EXTENSION) {
    // remove objects with class chromium
    const chromiumElements = document.getElementsByClassName("chromium");
    const chromiumElementsArray = Array.from(chromiumElements);
    chromiumElementsArray.forEach((element) => {
      element.remove();
    });
    populateBrowserList();
    checkFirefoxHotkeys();
  } else if (IS_CHROMIUM_EXTENSION) {
    // remove objects with class firefox from the page
    const firefoxElements = document.getElementsByClassName("firefox");
    const firefoxElementsArray = Array.from(firefoxElements);
    firefoxElementsArray.forEach((element) => {
      element.remove();
    });
    checkChromiumHotkeys();
    checkPrivateBrowsing();
    if (!(await getInstalledFirefoxVariant())) {
      document.getElementById("error-notification").style.display = "flex";
    }
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  await initGlean();
  activatePlatformSpecificElements();
  applyLocalization();
  updateTelemetry();

  // hide the error on close
  document.getElementById("close-button").addEventListener("click", () => {
    document.getElementById("error-notification").classList.add("hidden");
  });
});
