function loadLocalizedMessages() {
  document.getElementById("welcome").innerText = chrome.i18n.getMessage("welcomeHeading");
  document.getElementById("firefox-not-installed-error-heading").innerText = chrome.i18n.getMessage("notInstalledErrorHeading");
  document.getElementById("firefox-not-installed-error-message").innerText = chrome.i18n.getMessage("notInstalledErrorText");
  document.getElementById("firefox-not-installed-error-button").innerText = chrome.i18n.getMessage("notInstalledErrorAction");
}

function isFirefoxInstalled() {
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

async function showNotInstalledError() {
  if (await isFirefoxInstalled()) {
    document.getElementById("firefox-not-installed-error").style.display = "none";
  } else {
    document.getElementById("firefox-not-installed-error").style.display = "block";
    document.getElementById("firefox-not-installed-error-button").addEventListener("click", handleInstallFirefox);
  }
}

async function checkHotkeys() {
  // get hotkeys with id launchFirefox and launchFirefoxPrivate
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

function handleShortcutsPageClick() {
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
}

function handleInstallFirefox() {
  chrome.tabs.create({ url: "https://www.mozilla.org/firefox/" });
}

document.addEventListener("DOMContentLoaded", async function() {
  loadLocalizedMessages();
  await showNotInstalledError();
  await checkHotkeys();
});

// -------------------------------------------
//                  Exports
// -------------------------------------------
chrome.welcome = {
  handleInstallFirefox,
  showNotInstalledError,
  isFirefoxInstalled,
};