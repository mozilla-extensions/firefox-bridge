import { getDefaultIconPath, getGreyedIconPath } from "Interfaces/getters.js";

/**
 * Updates the toolbar icon to the current default browser icon
 * or a greyed out version of the default browser icon if the
 * current tab is not a valid URL scheme.
 *
 * @param {number} tabId The id of the tab to update the icon for.
 * @param {string} url The url of the tab to update the icon for.
 */
export async function updateToolbarIcon(tabId, url) {
  const urlSchema = url.split(":")[0];
  const iconPath =
    urlSchema === "http" || urlSchema === "https" || urlSchema === "file"
      ? await getDefaultIconPath()
      : await getGreyedIconPath();
  browser.action.setIcon({ path: iconPath, tabId });
}
