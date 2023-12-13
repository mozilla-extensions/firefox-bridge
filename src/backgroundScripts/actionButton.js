import { getIsFirefoxDefault } from "./getters.js";
import { isCurrentTabValidUrlScheme } from "./launchBrowser.js";

export async function updateToolbarIcon() {
  let iconPath = (await getIsFirefoxDefault())
    ? {
      32: "../images/firefox32.png",
    }
    : {
      32: "../images/private32.png",
    };
  if (!isCurrentTabValidUrlScheme) {
    iconPath = (await getIsFirefoxDefault())
      ? {
        32: "../images/firefox32grey.png",
      }
      : {
        32: "../images/private32grey.png",
      };
  }
  
  chrome.action.setIcon({ path: iconPath });
}
