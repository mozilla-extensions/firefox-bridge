import { getExternalBrowser } from "../../shared/backgroundScripts/getters.js";

export function getIsFirefoxInstalled() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["isFirefoxInstalled"], (result) => {
      if (result.isFirefoxInstalled === undefined) {
        // placeholder
        chrome.storage.local.set({ isFirefoxInstalled: true });
        resolve(true);
      } else {
        resolve(result.isFirefoxInstalled);
      }
    });
  });
}

export async function getDefaultIconPath() {
  if (await getExternalBrowser() === "Firefox") {
    return {
      32: chrome.runtime.getURL("images/firefox/firefox32.png"),
    };
  } else {
    return {
      32: chrome.runtime.getURL("images/firefox-private/private32.png"),
    };
  }
}

export async function getGreyedIconPath() {
  if (await getExternalBrowser() === "Firefox") {
    return {
      32: chrome.runtime.getURL("images/firefox/firefox32grey.png"),
    };
  } else {
    return {
      32: chrome.runtime.getURL("images/firefox-private/private32grey.png"),
    };
  }
}