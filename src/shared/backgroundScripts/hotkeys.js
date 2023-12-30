import { launchBrowser } from "../../chromium/interfaces/launchBrowser.js";

export async function handleHotkeyPress(command, tab) {
  if (command === "launchBrowser") {
    await launchBrowser(tab, true);
  } else if (command === "launchFirefoxPrivate") {
    await launchBrowser(tab, false);
  }
}