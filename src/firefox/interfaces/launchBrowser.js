import { isCurrentTabValidUrlScheme } from "../../shared/backgroundScripts/validTab.js";

export async function launchBrowser(tab) {
  if (isCurrentTabValidUrlScheme) {
    console.log("launchBrowser");
    // launch browser
    return true;
  }
  return false;
}