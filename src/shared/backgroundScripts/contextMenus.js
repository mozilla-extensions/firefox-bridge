import { launchBrowser } from "../../chromium/interfaces/launchBrowser.js";
import { getExternalBrowser } from "./getters.js";

import {
  applyPlatformContextMenus,
  handlePlatformContextMenuClick,
} from "../../chromium/interfaces/contextMenus.js";

export async function initContextMenu() {
  const externalBrowser = await getExternalBrowser();
  console.log("externalBrowser", externalBrowser);
  // page context menu
  chrome.contextMenus.create({
    id: "launchInExternalBrowser",
    title: chrome.i18n
      .getMessage("launchInExternalBrowser")
      .replace("[BROWSER]", externalBrowser === "Firefox Private Browsing" ? "Firefox" : externalBrowser),
    contexts: ["page"],
  });

  // link context menu
  chrome.contextMenus.create({
    id: "launchInExternalBrowserLink",
    title: chrome.i18n
      .getMessage("launchInExternalBrowserLink")
      .replace("[BROWSER]", externalBrowser === "Firefox Private Browsing" ? "Firefox" : externalBrowser),
    contexts: ["link"],
  });

  // platform specific menu
  await applyPlatformContextMenus();

  // welcome page
  chrome.contextMenus.create({
    id: "separator",
    type: "separator",
    contexts: ["action"],
  });
  chrome.contextMenus.create({
    id: "openWelcomePage",
    title: chrome.i18n.getMessage("openWelcomePage"),
    contexts: ["action"],
  });
}

export async function handleContextMenuClick(info, tab) {
  if (
    info.menuItemId === "launchInExternalBrowser"
  ) {
    await launchBrowser(tab, true);
  } else if (info.menuItemId === "launchInExternalBrowserLink") {
    tab.url = info.linkUrl;
    await launchBrowser(tab, true);
  } else if (
    info.menuItemId === "openWelcomePage"
  ) {
    chrome.tabs.create({
      url: chrome.runtime.getURL("shared/pages/welcomePage/index.html"),
    });
  } else {
    await handlePlatformContextMenuClick(info, tab);
  }
  // } else if (info.menuItemId === "manageExternalSitesContextMenu") {
  //   chrome.tabs.create({
  //     url: "pages/myFirefoxSites/index.html",
  //   });
  // } else if (info.menuItemId === "autoRedirectCheckboxContextMenu") {
  //   handleAutoRedirectCheckboxContextMenuClick();
  // } else if (info.menuItemId === "addCurrentSiteToMySitesContextMenu") {
  //   await handleAddCurrentSiteToMySitesContextMenuClick();
  // }
}

// export async function handleAutoRedirectCheckboxContextMenuClick() {
//   const isAutoRedirect = await getIsAutoRedirect();

//   // If disabling, remove all rules and keep them in storage
//   // If enabling, add all rules from storage
//   if (isAutoRedirect) {
//     chrome.declarativeNetRequest.updateDynamicRules({
//       removeRuleIds: (await chrome.declarativeNetRequest.getDynamicRules()).map(
//         (rule) => rule.id
//       ),
//     });
//   } else {
//     await refreshDeclarativeNetRequestRules();
//   }
//   chrome.storage.local.set({ isAutoRedirect: !isAutoRedirect });
// }

// export async function handleAddCurrentSiteToMySitesContextMenuClick() {
//   console.log("adding site");
//   const sld = await getCurrentTabSLD();
//   if (sld === "") return;
//   chrome.storage.sync.get(["firefoxSites"], (result) => {
//     const entries = result.firefoxSites || [];
//     // if entries is empty, default to 1 for id. otherwise, increment the id
//     const newEntry = {
//       id: entries.length === 0 ? 1 : entries[entries.length - 1].id + 1,
//       url: `*.${sld}/*`,
//       isPrivate: false,
//     };

//     // don't add dupes
//     if (entries.find((entry) => entry.url === newEntry.url)) return;
//     entries.push(newEntry);
//     chrome.storage.sync.set({ firefoxSites: entries });
//   });
// }

// export async function updateAddCurrentSiteToMySitesContextMenu() {
//   if (await getCurrentTabSLD() !== "") {
//     chrome.contextMenus.update("addCurrentSiteToMySitesContextMenu", {
//       title: chrome.i18n.getMessage("Add_this_site_to_My_Firefox_Sites").replace("[SLD]", await getCurrentTabSLD()),
//       enabled: true
//     });
//   } else {
//     chrome.contextMenus.update("addCurrentSiteToMySitesContextMenu", {
//       title: chrome.i18n.getMessage("Add_this_site_to_My_Firefox_Sites").replace("[SLD] ", ""),
//       enabled: false
//     });
//   }
// }
