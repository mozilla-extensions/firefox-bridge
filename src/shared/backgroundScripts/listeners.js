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
  // Initialize the context menu if it hasn't been initialized yet
  browser.storage.session
    .get("isContextMenuInitialized")
    .then(async (result) => {
      if (result.isContextMenuInitialized === undefined) {
        await initContextMenu();
        browser.storage.session.set({ isContextMenuInitialized: true });
      }
    });

  browser.runtime.onInstalled.addListener(async (details) => {
    // await getIsAutoRedirect(); // resolve to true on fresh install
    if (details.reason === "install") {
      browser.tabs.create({
        url: browser.runtime.getURL("shared/pages/welcomePage/index.html"),
      });
    }
    await updateToolbarIcon();
  });

  browser.runtime.onStartup.addListener(async () => {
    await updateToolbarIcon();
  });

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    await handleContextMenuClick(info, tab);
  });

  browser.commands.onCommand.addListener(async (command) => {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    handleHotkeyPress(command, tabs[0]);
  });

  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    checkAndUpdateURLScheme(tab);
    updateToolbarIcon();
    // updateAddCurrentSiteToMySitesContextMenu();
  });

  browser.tabs.onCreated.addListener(async (tab) => {
    checkAndUpdateURLScheme(tab);
    updateToolbarIcon();
    // updateAddCurrentSiteToMySitesContextMenu();
  });

  browser.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await browser.tabs.get(activeInfo.tabId);
    checkAndUpdateURLScheme(tab);
    updateToolbarIcon();
    //   updateAddCurrentSiteToMySitesContextMenu();
  });

  browser.storage.sync.onChanged.addListener(async (changes) => {
    if (changes.currentExternalBrowser !== undefined) {
      await handleBrowserNameChange();
      await updateToolbarIcon();
    }
    // if (changes.firefoxSites !== undefined && await getIsAutoRedirect()) {
    //   refreshDeclarativeNetRequestRules();
    // }
  });

  //   browser.webRequest.onBeforeRequest.addListener(
  //     async (details) => {
  //       await handleAutoRedirect(details);
  //     },
  //     {
  //       urls: ["<all_urls>"],
  //       types: ["main_frame"],
  //     }
  //   );
}
