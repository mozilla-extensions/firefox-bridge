import { launchBrowser } from "./launchBrowser.js";

import { updateToolbarIcon } from "../../shared/backgroundScripts/actionButton.js";
import { getExternalBrowser } from "../../shared/backgroundScripts/getters.js";

export async function applyPlatformContextMenus() {
  const externalBrowserName = await getExternalBrowser();
  const alternateBrowserName = externalBrowserName === "Firefox" ? "Firefox Private Browsing" : "Firefox";
  // action context menu
  chrome.contextMenus.create({
    id: "changeDefaultLaunchContextMenu",
    title: chrome.i18n.getMessage("changeDefaultLaunchContextMenu"),
    contexts: ["action"],
    type: "checkbox",
    checked: !(externalBrowserName === "Firefox"),
  });
  chrome.contextMenus.create({
    id: "alternativeLaunchContextMenu",
    title: chrome.i18n
      .getMessage("launchInExternalBrowser", alternateBrowserName),
    contexts: ["action"],
  });


  // External sites context menu
  // chrome.contextMenus.create({
  //   id: "separator",
  //   type: "separator",
  //   contexts: ["action"],
  // });
  // chrome.contextMenus.create({
  //   id: "addCurrentSiteToMySitesContextMenu",
  //   title: chrome.i18n.getMessage("addCurrentSiteToMySitesContextMenu").replace("[SLD] ", ""),
  //   contexts: ["action"],
  //   enabled: false
  // });
  // chrome.contextMenus.create({
  //   id: "autoRedirectCheckboxContextMenu",
  //   title: chrome.i18n.getMessage("autoRedirectCheckboxContextMenu"),
  //   contexts: ["action"],
  //   type: "checkbox",
  //   checked: await getIsAutoRedirect(),
  // });
  // chrome.contextMenus.create({
  //   id: "manageExternalSitesContextMenu",
  //   title: chrome.i18n.getMessage("manageExternalSitesContextMenu"),
  //   contexts: ["action"],
  // });

  // page context menu
  chrome.contextMenus.create({
    id: "launchInExternalBrowserPrivate",
    title: chrome.i18n
      .getMessage("launchInExternalBrowser", alternateBrowserName),
    contexts: ["page"],
  });

  // link context menu
  chrome.contextMenus.create({
    id: "launchInExternalBrowserPrivateLink",
    title: chrome.i18n
      .getMessage("launchInExternalBrowserLink", alternateBrowserName),
    contexts: ["link"],
  });
}

export async function handleChangeDefaultLaunchContextMenuClick() {
  console.log("changing default");
  const externalBrowserName = await getExternalBrowser();
  chrome.contextMenus.update("alternativeLaunchContextMenu", {
    title: chrome.i18n
      .getMessage("launchInExternalBrowser", externalBrowserName),
  });

  if (externalBrowserName === "Firefox") {
    chrome.storage.sync.set({ currentExternalBrowser: "Firefox Private Browsing" });
  } else {
    chrome.storage.sync.set({ currentExternalBrowser: "Firefox" });
  }
  await updateToolbarIcon();
}

export async function handlePlatformContextMenuClick(info, tab) {
  const externalBrowserName = await getExternalBrowser();
  if (info.menuItemId === "changeDefaultLaunchContextMenu") {
    await handleChangeDefaultLaunchContextMenuClick();
  } else if (info.menuItemId === "alternativeLaunchContextMenu") {
    // launch in the opposite mode to the default
    await launchBrowser(tab, !(externalBrowserName === "Firefox"));
  } else if (
    info.menuItemId === "launchInExternalBrowserPrivate"
  ) {
    await launchBrowser(tab, false);
  } else if (
    info.menuItemId === "launchInExternalBrowserPrivateLink"
  ) {
    tab.url = info.linkUrl;
    await launchBrowser(tab, false);
  }
}
