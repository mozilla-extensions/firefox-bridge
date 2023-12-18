import { launchBrowser } from "../../chromium/interfaces/launchBrowser.js";

export async function handleHotkeyPress(command, tab) {
  if (command === "launchFirefox") {
    await launchBrowser(tab, true);
  } else if (command === "launchFirefoxPrivate") {
    await launchBrowser(tab, false);
  }
}