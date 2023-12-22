export async function getDefaultIconPath() {
  return { 32: chrome.runtime.getURL("images/chrome/32.png")};
}

export async function getGreyedIconPath() {
  return { 32: chrome.runtime.getURL("images/chrome/32grey.png") };
}
