/**
 * Replaces the text of the elements with the given ids with the localized text.
 */
function loadLocalizedMessages() {
  document.getElementById("welcome").innerText = chrome.i18n.getMessage("welcomeHeading");
  document.getElementById("firefox-not-installed-error-heading").innerText = chrome.i18n.getMessage("notInstalledErrorHeading");
  document.getElementById("firefox-not-installed-error-message").innerText = chrome.i18n.getMessage("notInstalledErrorText");
  document.getElementById("firefox-not-installed-error-button").innerText = chrome.i18n.getMessage("notInstalledErrorAction");
}

/**
 * @returns {Promise<boolean>} True if Firefox is installed on the system, false otherwise.
 */
export function isFirefoxInstalled() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["isFirefoxInstalled"], (result) => {
      if (result.isFirefoxInstalled === undefined) {
        resolve(false);
      } else {
        resolve(result.isFirefoxInstalled);
      }
    });
  });
}

/**
 * Show the not installed error if Firefox is not installed.
 */
export async function showNotInstalledError() {
  if (await isFirefoxInstalled()) {
    document.getElementById("firefox-not-installed-error").style.display = "none";
  } else {
    document.getElementById("firefox-not-installed-error").style.display = "block";
    document.getElementById("firefox-not-installed-error-button").addEventListener("click", handleInstallFirefox);
  }
}

/**
 * Check the currently set hotkeys and update the text.
 */
export async function checkHotkeys() {
  // get hotkeys with id launcBrowser (launches Firefox) and launchFirefoxPrivate
  const hotkeys = await chrome.commands.getAll();
  const launchFirefox = hotkeys.find((hotkey) => hotkey.name === "launchBrowser");
  const launchFirefoxHotkey = launchFirefox.shortcut || "Not Yet Defined.";
  const launchFirefoxPrivate = hotkeys.find((hotkey) => hotkey.name === "launchFirefoxPrivate");
  const launchFirefoxPrivateHotkey = launchFirefoxPrivate.shortcut || "Not Yet Defined.";

  // update hotkey text
  document.getElementById("launchFirefoxHotkey").innerText = launchFirefoxHotkey;
  document.getElementById("launchFirefoxPrivateHotkey").innerText = launchFirefoxPrivateHotkey;

  // add event listeners
  document.getElementById("changeHotkeys").addEventListener("click", handleShortcutsPageClick);
}

/**
 * Open the shortcuts page.
 */
export function handleShortcutsPageClick() {
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
}

/**
 * Open the Firefox download page.
 */
export function handleInstallFirefox() {
  chrome.tabs.create({ url: "https://www.mozilla.org/firefox/" });
}

document.addEventListener("DOMContentLoaded", async function() {
  loadLocalizedMessages();
  await showNotInstalledError();
  await checkHotkeys();
});