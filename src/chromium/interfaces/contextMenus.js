import { getIsFirefoxDefault } from "./getIcon.js";

import { updateToolbarIcon } from "../../shared/backgroundScripts/actionButton.js";
import { launchFirefox } from "../../shared/backgroundScripts/launchBrowser.js";

export async function applyPlatformContextMenus() {
  // action context menu
  chrome.contextMenus.create({
    id: "changeDefaultLaunchContextMenu",
    title: chrome.i18n.getMessage("Always_use_Firefox_Private_Browsing"),
    contexts: ["action"],
    type: "checkbox",
    checked: !(await getIsFirefoxDefault()),
  });
  chrome.contextMenus.create({
    id: "alternativeLaunchContextMenu",
    title: chrome.i18n.getMessage(
      "Launch_this_page_in_Firefox_Private_Browsing"
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
  //   title: chrome.i18n.getMessage("Add_this_site_to_My_Firefox_Sites").replace("[SLD] ", ""),
  //   contexts: ["action"],
  //   enabled: false
  // });
  // chrome.contextMenus.create({
  //   id: "autoRedirectCheckboxContextMenu",
  //   title: chrome.i18n.getMessage("auto_redirect_my_firefox_sites"),
  //   contexts: ["action"],
  //   type: "checkbox",
  //   checked: await getIsAutoRedirect(),
  // });
  // chrome.contextMenus.create({
  //   id: "manageExternalSitesContextMenu",
  //   title: chrome.i18n.getMessage("Manage_My_Firefox_Sites"),
  //   contexts: ["action"],
  // });

  // page context menu
  chrome.contextMenus.create({
    id: "launchInExternalBrowserPrivate",
    title: chrome.i18n.getMessage(
      "Launch_this_page_in_Firefox_Private_Browsing"
    ),
    contexts: ["page"],
  });
  
  // link context menu
  chrome.contextMenus.create({
    id: "launchInExternalBrowserPrivateLink",
    title: chrome.i18n.getMessage(
      "Launch_this_link_in_Firefox_Private_Browsing"
    ),
    contexts: ["link"],
  });
}

export async function handleChangeDefaultLaunchContextMenuClick() {
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
  updateToolbarIcon();
}

export async function handlePlatformContextMenuClick(info, tab){
  const isFirefoxDefault = await getIsFirefoxDefault();
  if (info.menuItemId === "changeDefaultLaunchContextMenu") {
    await handleChangeDefaultLaunchContextMenuClick();
  } else if (info.menuItemId === "alternativeLaunchContextMenu") {
    // launch in the opposite mode to the default
    await launchFirefox(tab, !isFirefoxDefault);
  }
}