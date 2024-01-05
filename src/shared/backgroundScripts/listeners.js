// shared imports
import { initContextMenu, handleContextMenuClick } from "./contextMenus.js";
import { checkAndUpdateURLScheme } from "./validTab.js";
import { handleHotkeyPress } from "./hotkeys.js";
import { updateToolbarIcon } from "./actionButton.js";
import { handleBrowserNameChange } from "./contextMenus.js";
// import { handleAutoRedirect, refreshDeclarativeNetRequestRules } from "./autoRedirect.js";

// eslint-disable-next-line no-unused-vars
import * as browserObjectForGlean from "../../browser-polyfill.js"; // required for Glean in chromium
import Glean from "@mozilla/glean/webext";
import { install, startup } from "../generated/pings.js";
import * as installEvent from "../generated/installEvent.js";
import * as startupEvent from "../generated/startupEvent.js";

export function initGlean() {
  Glean.setLogPings(true);
  Glean.initialize("firefox.launch", true, {
    appDisplayVersion: chrome.runtime.getManifest().version,
  });
}

export function initSharedTelemetry() {
  chrome.runtime.onInstalled.addListener(() => {
    initGlean();
    installEvent.dateInstalled.set(new Date());
    installEvent.browserType.set(
      chrome.runtime.getManifest().is_chrome ? "chromium" : "firefox"
    );
    install.submit();

  });

  chrome.runtime.onStartup.addListener(async () => {
    // 2. browser version (window.navigator.userAgent)
    initGlean();
    startupEvent.browserType.set(
      chrome.runtime.getManifest().is_chrome ? "chromium" : "firefox"
    );
    startupEvent.dateStarted.set(new Date());
    startupEvent.browserLanguageLocale.set(navigator.language);
    startupEvent.extensionLanguageLocale.set(chrome.i18n.getUILanguage());
    startupEvent.isPinned.set(
      (await chrome.action.getUserSettings()).isOnToolbar
    );
    const commands = await chrome.commands.getAll();
    for (const command of commands) {
      startupEvent.hotkeys[command.name.toLowerCase()].set(command.shortcut);
    }
    startup.submit();
  });
}

export function initSharedListeners() {
  chrome.runtime.onInstalled.addListener(async () => {
    // await getIsAutoRedirect(); // resolve to true on fresh install
    chrome.tabs.create({ url: "../pages/welcomePage/index.html" });
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
      console.log("browser changed");
      await handleBrowserNameChange();
      updateToolbarIcon();
    }
    // if (changes.firefoxSites !== undefined && await getIsAutoRedirect()) {
    //   console.log("refreshing rules");
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
