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

function handleInstallFirefox() {
  chrome.tabs.create({ url: "https://www.mozilla.org/firefox/" });
}

document.addEventListener("DOMContentLoaded", loadLocalizedMessages);
document.addEventListener("DOMContentLoaded", showNotInstalledError);

// -------------------------------------------
//                  Exports
// -------------------------------------------
chrome.welcome = {
  handleInstallFirefox,
  showNotInstalledError,
  isFirefoxInstalled,
};