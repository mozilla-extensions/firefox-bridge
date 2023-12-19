import { getIsFirefoxDefault } from "./getIcon.js";

import { updateToolbarIcon } from "../../shared/backgroundScripts/actionButton.js";
import { launchBrowser } from "./launchBrowser.js";

export async function applyPlatformContextMenus() {
  // action context menu
  chrome.contextMenus.create({
    id: "changeDefaultLaunchContextMenu",
    title: chrome.i18n.getMessage("changeDefaultLaunchContextMenu"),
    contexts: ["action"],
    type: "checkbox",
    checked: !(await getIsFirefoxDefault()),
  });
  chrome.contextMenus.create({
    id: "alternativeLaunchContextMenu",
    title: chrome.i18n.getMessage(
      "alternativeLaunchContextMenu"
    ),
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
    title: chrome.i18n.getMessage(
      "launchInExternalBrowserPrivate"
    ),
    contexts: ["page"],
  });
  
  // link context menu
  chrome.contextMenus.create({
    id: "launchInExternalBrowserPrivateLink",
    title: chrome.i18n.getMessage(
      "launchInExternalBrowserPrivateLink"
    ),
    contexts: ["link"],
  });
}

export async function handleChangeDefaultLaunchContextMenuClick() {
  console.log("changing default");
  const isFirefoxDefault = await getIsFirefoxDefault();
  if (isFirefoxDefault) {
    chrome.contextMenus.update("alternativeLaunchContextMenu", {
      title: chrome.i18n.getMessage("Launch_this_page_in_Firefox"),
    });
  } else {
    chrome.contextMenus.update("alternativeLaunchContextMenu", {
      title: chrome.i18n.getMessage(
        "Launch_this_page_in_Firefox_Private_Browsing"
      ),
    });
  }
  chrome.storage.sync.set({ isFirefoxDefault: !isFirefoxDefault });
  await updateToolbarIcon();
}

export async function handlePlatformContextMenuClick(info, tab){
  const isFirefoxDefault = await getIsFirefoxDefault();
  if (info.menuItemId === "changeDefaultLaunchContextMenu") {
    await handleChangeDefaultLaunchContextMenuClick();
  } else if (info.menuItemId === "alternativeLaunchContextMenu") {
    // launch in the opposite mode to the default
    await launchBrowser(tab, !isFirefoxDefault);
  } else if (
    info.menuItemId === "launchInFirefoxPrivate" ||
      info.menuItemId === "launchInFirefoxPrivateLink"
  ) {
    await launchBrowser(tab, false);
  }
}