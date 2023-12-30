import { getExternalBrowser } from "../../shared/backgroundScripts/getters.js";

export async function getDefaultIconPath() {
  const browserName = (await getExternalBrowser()).toLowerCase();
  if (!browserName) {
    return { 32: chrome.runtime.getURL("images/firefox-launch/32.png") };
  }
  return { 32: chrome.runtime.getURL(`images/${browserName}/32.png`) };
}

export async function getGreyedIconPath() {
  const browserName = (await getExternalBrowser()).toLowerCase();
  if (!browserName) {
    return { 32: chrome.runtime.getURL("images/firefox-launch/32.png") };
  }
  return { 32: chrome.runtime.getURL(`images/${browserName}/32grey.png`) };
}

export function getExternalBrowserLaunchProtocol() {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ["currentExternalBrowserLaunchProtocol"],
      (result) => {
        if (
          !result ||
          result.currentExternalBrowserLaunchProtocol === undefined
        ) {
          resolve("");
        } else {
          resolve(result.currentExternalBrowserLaunchProtocol);
        }
      }
    );
  });
}
