// shared imports
import { initContextMenu, handleContextMenuClick } from "./contextMenus.js";
import { checkAndUpdateURLScheme } from "./validTab.js";
import { handleHotkeyPress } from "./hotkeys.js";
import { updateToolbarIcon } from "./actionButton.js";
import { handleBrowserNameChange } from "./contextMenus.js";
// import { handleAutoRedirect, refreshDeclarativeNetRequestRules } from "./autoRedirect.js";

/**
 * Initialize the listeners that are shared between Firefox and Chromium.
 */
export function initSharedListeners() {
  chrome.runtime.onInstalled.addListener(async () => {
    // await getIsAutoRedirect(); // resolve to true on fresh install
    chrome.tabs.create({ url: chrome.runtime.getURL("shared/pages/welcomePage/index.html") });
    await initContextMenu();
    await updateToolbarIcon();
  });

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    await handleContextMenuClick(info, tab);
  });

  chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      handleHotkeyPress(command, tabs[0]);
    });
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    checkAndUpdateURLScheme(tab);
    updateToolbarIcon();
    // updateAddCurrentSiteToMySitesContextMenu();
  });

  chrome.tabs.onCreated.addListener(async (tab) => {
    checkAndUpdateURLScheme(tab);
    updateToolbarIcon();
    // updateAddCurrentSiteToMySitesContextMenu();
  });

  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      checkAndUpdateURLScheme(tab);
      updateToolbarIcon();
      //   updateAddCurrentSiteToMySitesContextMenu();
    });
  });

  chrome.storage.sync.onChanged.addListener(async (changes) => {
    if (changes.currentExternalBrowser !== undefined) {
      await handleBrowserNameChange();
      await updateToolbarIcon();
    }
    // if (changes.firefoxSites !== undefined && await getIsAutoRedirect()) {
    //   refreshDeclarativeNetRequestRules();
    // }
  });

  //   chrome.webRequest.onBeforeRequest.addListener(
  //     async (details) => {
  //       await handleAutoRedirect(details);
  //     },
  //     {
  //       urls: ["<all_urls>"],
  //       types: ["main_frame"],
  //     }
  //   );
}
