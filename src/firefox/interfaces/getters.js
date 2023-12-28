export function getDefaultIconPath() {
  return { 32: chrome.runtime.getURL("images/chrome/32.png")};
}

export function getGreyedIconPath() {
  return { 32: chrome.runtime.getURL("images/chrome/32grey.png") };
}

export function getExternalBrowserLaunchProtocol() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["currentExternalBrowserLaunchProtocol"], (result) => {
      if (!result || result.currentExternalBrowserLaunchProtocol === undefined) {
        resolve("");
      } else {
        resolve(result.currentExternalBrowserLaunchProtocol);
      }
    });
  });
}
