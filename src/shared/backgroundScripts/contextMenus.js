import { launchFirefox } from "./launchBrowser.js";
import { getCurrentTabSLD, getIsFirefoxDefault, getIsAutoRedirect } from "./getters.js";
import { refreshDeclarativeNetRequestRules } from "./autoRedirect.js";
import { updateToolbarIcon } from "./actionButton.js";

export async function updateAddCurrentSiteToMySitesContextMenu() {
  if (await getCurrentTabSLD() !== "") {
    chrome.contextMenus.update("addCurrentSiteToMySitesContextMenu", {
      title: chrome.i18n.getMessage("Add_this_site_to_My_Firefox_Sites").replace("[SLD]", await getCurrentTabSLD()),
      enabled: true
    });
  } else {
    chrome.contextMenus.update("addCurrentSiteToMySitesContextMenu", {
      title: chrome.i18n.getMessage("Add_this_site_to_My_Firefox_Sites").replace("[SLD] ", ""),
      enabled: false
    });
  }
}
  
export async function initContextMenu() {
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
  chrome.contextMenus.create({
    id: "separator",
    type: "separator",
    contexts: ["action"],
  });
  chrome.contextMenus.create({
    id: "addCurrentSiteToMySitesContextMenu",
    title: chrome.i18n.getMessage("Add_this_site_to_My_Firefox_Sites").replace("[SLD] ", ""),
    contexts: ["action"],
    enabled: false
  });
  chrome.contextMenus.create({
    id: "autoRedirectCheckboxContextMenu",
    title: chrome.i18n.getMessage("auto_redirect_my_firefox_sites"),
    contexts: ["action"],
    type: "checkbox",
    checked: await getIsAutoRedirect(),
  });
  chrome.contextMenus.create({
    id: "manageExternalSitesContextMenu",
    title: chrome.i18n.getMessage("Manage_My_Firefox_Sites"),
    contexts: ["action"],
  });
  
  // page context menu
  chrome.contextMenus.create({
    id: "launchInFirefox",
    title: chrome.i18n.getMessage("Launch_this_page_in_Firefox"),
    contexts: ["page"],
  });
  chrome.contextMenus.create({
    id: "launchInFirefoxPrivate",
    title: chrome.i18n.getMessage(
      "Launch_this_page_in_Firefox_Private_Browsing"
    ),
    contexts: ["page"],
  });
  
  chrome.contextMenus.create({
    id: "launchInFirefoxLink",
    title: chrome.i18n.getMessage("Launch_this_link_in_Firefox"),
    contexts: ["link"],
  });
  chrome.contextMenus.create({
    id: "launchInFirefoxPrivateLink",
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
  
export async function handleAutoRedirectCheckboxContextMenuClick() {
  const isAutoRedirect = await getIsAutoRedirect();
  
  // If disabling, remove all rules and keep them in storage
  // If enabling, add all rules from storage
  if (isAutoRedirect) {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: (await chrome.declarativeNetRequest.getDynamicRules()).map(
        (rule) => rule.id
      ),
    });
  } else {
    await refreshDeclarativeNetRequestRules();
  }
  chrome.storage.local.set({ isAutoRedirect: !isAutoRedirect });
}
  
export async function handleAddCurrentSiteToMySitesContextMenuClick() {
  console.log("adding site");
  const sld = await getCurrentTabSLD();
  if (sld === "") return;
  chrome.storage.sync.get(["firefoxSites"], (result) => {
    const entries = result.firefoxSites || [];
    // if entries is empty, default to 1 for id. otherwise, increment the id
    const newEntry = {
      id: entries.length === 0 ? 1 : entries[entries.length - 1].id + 1,
      url: `*.${sld}/*`,
      isPrivate: false,
    };
  
    // don't add dupes
    if (entries.find((entry) => entry.url === newEntry.url)) return;
    entries.push(newEntry);
    chrome.storage.sync.set({ firefoxSites: entries });
  });
}
  
export async function handleContextMenuClick(info, tab) {
  const isFirefoxDefault = await getIsFirefoxDefault();
  if (info.menuItemId === "changeDefaultLaunchContextMenu") {
    await handleChangeDefaultLaunchContextMenuClick();
  } else if (info.menuItemId === "alternativeLaunchContextMenu") {
    // launch in the opposite mode to the default
    await launchFirefox(tab, !isFirefoxDefault);
  } else if (
    info.menuItemId === "launchInFirefox" ||
      info.menuItemId === "launchInFirefoxLink"
  ) {
    await launchFirefox(tab, true);
  } else if (
    info.menuItemId === "launchInFirefoxPrivate" ||
      info.menuItemId === "launchInFirefoxPrivateLink"
  ) {
    await launchFirefox(tab, false);
  } else if (info.menuItemId === "manageExternalSitesContextMenu") {
    chrome.tabs.create({
      url: "pages/myFirefoxSites/index.html",
    });
  } else if (info.menuItemId === "autoRedirectCheckboxContextMenu") {
    handleAutoRedirectCheckboxContextMenuClick();
  } else if (info.menuItemId === "addCurrentSiteToMySitesContextMenu") {
    await handleAddCurrentSiteToMySitesContextMenuClick();
  }
}