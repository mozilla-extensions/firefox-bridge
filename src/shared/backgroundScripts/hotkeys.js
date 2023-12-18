import { launchFirefox } from "./launchBrowser.js";

export async function handleHotkeyPress(command, tab) {
  if (command === "launchFirefox") {
    await launchFirefox(tab, true);
  } else if (command === "launchFirefoxPrivate") {
    await launchFirefox(tab, false);
  }
}