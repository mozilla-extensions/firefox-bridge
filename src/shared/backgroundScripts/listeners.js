// shared imports
import { initContextMenu, handleContextMenuClick } from "./contextMenus.js";
// import { handleAutoRedirect, refreshDeclarativeNetRequestRules } from "./autoRedirect.js";
import { checkAndUpdateURLScheme } from "./validTab.js";
import { handleHotkeyPress } from "./hotkeys.js";
import { updateToolbarIcon } from "./actionButton.js";

// // interface imports
import { getIsFirefoxDefault, getIsFirefoxInstalled } from "../../chromium/interfaces/getIcon.js";
import { launchBrowser } from "../../chromium/interfaces/launchBrowser.js";

export function initSharedListeners() {

  chrome.runtime.onInstalled.addListener(async () => {
    // await getIsAutoRedirect(); // resolve to true on fresh install
    chrome.tabs.create({ url: "../shared/pages/welcomePage/index.html" });
    await initContextMenu();
    await updateToolbarIcon();
  });

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    await handleContextMenuClick(info, tab);
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

  chrome.storage.sync.onChanged.addListener(async (changes) => {
    if (changes.isFirefoxDefault !== undefined) {
      updateToolbarIcon();
    } 
    // if (changes.firefoxSites !== undefined && await getIsAutoRedirect()) {
    //   console.log("refreshing rules");
    //   refreshDeclarativeNetRequestRules();
    // }
  });

  chrome.action.onClicked.addListener(async (tab) => {
    launchBrowser(tab, await getIsFirefoxDefault());
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

  chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      handleHotkeyPress(command, tabs[0]);
    });
  });
}