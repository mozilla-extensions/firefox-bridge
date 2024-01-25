import { isCurrentTabValidUrlScheme } from "./validTab.js";
import { getDefaultIconPath } from "../../chromium/interfaces/getters.js";

/**
 * Updates the toolbar icon to the current default browser icon
 * or a greyed out version of the default browser icon if the
 * current tab is not a valid URL scheme.
 */
export async function updateToolbarIcon() {
  let iconPath = await getDefaultIconPath();
  const action = browser.action || browser.browserAction;
  await action.setIcon({ path: iconPath });
  if (!isCurrentTabValidUrlScheme) {
    console.log("disabling");
    await action.disable();
  } else {
    await action.enable();
  }
}
