import { isCurrentTabValidUrlScheme } from "./validTab.js";

import { getDefaultIconPath, getGreyedIconPath } from "../../chromium/interfaces/getters.js";

export async function updateToolbarIcon() {
  let iconPath = await getDefaultIconPath();
  if (!isCurrentTabValidUrlScheme) {
    iconPath = await getGreyedIconPath();
  }
  chrome.action.setIcon({ path: iconPath });
}
