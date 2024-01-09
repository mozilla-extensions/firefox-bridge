import { launchBrowser } from "../../chromium/interfaces/launchBrowser.js";
import { getExternalBrowser } from "./getters.js";

export async function handleHotkeyPress(command, tab) {
  if (command === "launchBrowser") {
    if (await launchBrowser(tab, true)){
      chrome.storage.local.set({
        telemetry: {
          type: "browserLaunch",
          browser: await getExternalBrowser(),
          source: "hotkey",
        },
      });
    }
  } else if (command === "launchFirefoxPrivate") {
    if (await launchBrowser(tab, false)){
      chrome.storage.local.set({
        telemetry: {
          type: "browserLaunch",
          browser: "Firefox Private Browsing",
          source: "hotkey",
        },
      });
    }
  }
}