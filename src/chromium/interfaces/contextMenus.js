import { launchBrowser } from "./launchBrowser.js";

import { updateToolbarIcon } from "../../shared/backgroundScripts/actionButton.js";
import { getExternalBrowser } from "../../shared/backgroundScripts/getters.js";

export async function applyPlatformContextMenus() {
  const externalBrowserName = (await getExternalBrowser()) || "Firefox";
  const alternateBrowserName =
    externalBrowserName === "Firefox" ? "Firefox Private Browsing" : "Firefox";
  // action context menu
  browser.contextMenus.create({
    id: "changeDefaultLaunchContextMenu",
    title: chrome.i18n.getMessage("changeDefaultLaunchContextMenu"),
    contexts: ["action"],
    type: "checkbox",
    checked: !(externalBrowserName === "Firefox"),
  });
  chrome.contextMenus.create({
    id: "alternativeLaunchContextMenu",
    title: chrome.i18n.getMessage(
      "launchInExternalBrowser",
      alternateBrowserName
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
      "launchInExternalBrowser",
      "Firefox Private Browsing"
    ),
    contexts: ["page"],
  });

  // link context menu
  chrome.contextMenus.create({
    id: "launchInExternalBrowserPrivateLink",
    title: chrome.i18n.getMessage(
      "launchInExternalBrowserLink",
      "Firefox Private Browsing"
    ),
    contexts: ["link"],
  });
}

export async function handleChangeDefaultLaunchContextMenuClick() {
  const externalBrowserName = await getExternalBrowser();

  chrome.contextMenus.update("changeDefaultLaunchContextMenu", {
    checked: externalBrowserName === "Firefox",
  });
  chrome.contextMenus.update("alternativeLaunchContextMenu", {
    title: chrome.i18n.getMessage(
      "launchInExternalBrowser",
      externalBrowserName
    ),
  });

  if (externalBrowserName === "Firefox") {
    chrome.storage.sync.set({
      currentExternalBrowser: "Firefox Private Browsing",
    });
  } else {
    chrome.storage.sync.set({ currentExternalBrowser: "Firefox" });
  }
  await updateToolbarIcon();
}

export async function handlePlatformContextMenuClick(info, tab) {
  const externalBrowserName = await getExternalBrowser();
  if (info.menuItemId === "changeDefaultLaunchContextMenu") {
    await handleChangeDefaultLaunchContextMenuClick();
    chrome.storage.local.set({
      telemetry: {
        type: "currentBrowserChange",
        from: externalBrowserName,
        to:
          externalBrowserName === "Firefox"
            ? "Firefox Private Browsing"
            : "Firefox",
      },
    });
  } else if (info.menuItemId === "alternativeLaunchContextMenu") {
    // launch in the opposite mode to the default
    if (await launchBrowser(tab, !(externalBrowserName === "Firefox"))) {
      const launchedBrowserName =
        (await getExternalBrowser()) === "Firefox"
          ? "Firefox Private Browsing"
          : "Firefox";
      chrome.storage.local.set({
        telemetry: {
          type: "browserLaunch",
          browser: launchedBrowserName,
          source: "action_context_menu",
        },
      });
    }
  } else if (info.menuItemId === "launchInExternalBrowserPrivate") {
    if (await launchBrowser(tab, false)) {
      chrome.storage.local.set({
        telemetry: {
          type: "browserLaunch",
          browser: "Firefox Private Browsing",
          source: "page_context_menu",
        },
      });
    }
  } else if (info.menuItemId === "launchInExternalBrowserPrivateLink") {
    tab.url = info.linkUrl;
    if (await launchBrowser(tab, false)) {
      chrome.storage.local.set({
        telemetry: {
          type: "browserLaunch",
          browser: "Firefox Private Browsing",
          source: "link_context_menu",
        },
      });
    }
  }
}
