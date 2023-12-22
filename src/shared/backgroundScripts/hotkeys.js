import { launchBrowser } from "../../chromium/interfaces/launchBrowser.js";

export async function handleHotkeyPress(command, tab) {
  if (command === "launchBrowser") {
    await launchBrowser(tab);
  } else if (command === "launchFirefoxPrivate") {
    await launchBrowser(tab, false);
  }
}