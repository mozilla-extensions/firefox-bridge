import { isCurrentTabValidUrlScheme } from "./validTab.js";
import { getDefaultIconPath, getGreyedIconPath } from "Interfaces/getters.js";

/**
 * Updates the toolbar icon to the current default browser icon
 * or a greyed out version of the default browser icon if the
 * current tab is not a valid URL scheme.
 */
export async function updateToolbarIcon() {
  let iconPath = await getDefaultIconPath();
  if (!isCurrentTabValidUrlScheme) {
    iconPath = await getGreyedIconPath();
  }
  browser.action.setIcon({ path: iconPath });
}
