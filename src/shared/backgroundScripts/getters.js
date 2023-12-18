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

export function getIsFirefoxDefault() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["isFirefoxDefault"], (result) => {
      if (result.isFirefoxDefault === undefined) {
        resolve(true);
      } else {
        resolve(result.isFirefoxDefault);
      }
    });
  });
}

export function getIsAutoRedirect() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["isAutoRedirect"], (result) => {
      if (result.isAutoRedirect === undefined) {
        resolve(true);
        chrome.storage.local.set({ isAutoRedirect: true });
      } else {
        resolve(result.isAutoRedirect);
      }
    });
  });
}

export function getExternalSites() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["firefoxSites"], (result) => {
      if (result.firefoxSites === undefined) {
        resolve([]);
      } else {
        resolve(result.firefoxSites);
      }
    });
  });
}

export function getCurrentTabSLD() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab.url === undefined || !currentTab.url.startsWith("http")) resolve("");

      try {
        const url = new URL(tabs[0].url);
        resolve(url.hostname.split(".").slice(-2).join("."));
      } catch (e) {
        resolve("");
      }
    });
  });
}