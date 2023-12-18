import { isCurrentTabValidUrlScheme } from "./launchBrowser.js";

import { getDefaultIconPath, getGreyedIconPath } from "../../chromium/interfaces/getIcon.js";

export async function updateToolbarIcon() {
  let iconPath = await getDefaultIconPath();
  if (!isCurrentTabValidUrlScheme) {
    iconPath = await getGreyedIconPath();
  }
  
  console.log("iconPath", iconPath);
  chrome.action.setIcon({ path: iconPath });
}
