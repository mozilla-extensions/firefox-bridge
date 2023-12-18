
import { getIsFirefoxInstalled, getIsFirefoxDefault, getIsAutoRedirect } from "./getters.js";
import { initContextMenu, handleContextMenuClick, updateAddCurrentSiteToMySitesContextMenu } from "./contextMenus.js";
import { handleAutoRedirect, refreshDeclarativeNetRequestRules } from "./autoRedirect.js";
import { launchFirefox, checkAndUpdateURLScheme } from "./launchBrowser.js";
import { handleHotkeyPress } from "./hotkeys.js";
import { updateToolbarIcon } from "./actionButton.js";

chrome.runtime.onInstalled.addListener(async () => {
  await getIsFirefoxInstalled(); // call this to let the welcome page know if Firefox is installed
  await getIsAutoRedirect(); // resolve to true on fresh install
  chrome.tabs.create({ url: "pages/welcomePage/index.html" });
  await initContextMenu();
  await updateToolbarIcon();
  // dev
  chrome.tabs.create({
    url: "pages/myFirefoxSites/index.html",
  });

  console.log(chrome.runtime.getManifest().minimum_chrome_version);
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  await handleContextMenuClick(info, tab);
});


chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    await handleAutoRedirect(details);
  },
  {
    urls: ["<all_urls>"],
    types: ["main_frame"],
  }
);

chrome.storage.sync.onChanged.addListener(async (changes) => {
  if (changes.isFirefoxDefault !== undefined) {
    updateToolbarIcon();
  } 
  if (changes.firefoxSites !== undefined && await getIsAutoRedirect()) {
    console.log("refreshing rules");
    refreshDeclarativeNetRequestRules();
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  launchFirefox(tab, await getIsFirefoxDefault());
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  checkAndUpdateURLScheme(tab);
  updateToolbarIcon();
  updateAddCurrentSiteToMySitesContextMenu();
});

chrome.tabs.onCreated.addListener(async (tab) => {
  checkAndUpdateURLScheme(tab);
  updateToolbarIcon();
  updateAddCurrentSiteToMySitesContextMenu();
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    checkAndUpdateURLScheme(tab);
    updateToolbarIcon();
    updateAddCurrentSiteToMySitesContextMenu();
  });
});

chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    handleHotkeyPress(command, tabs[0]);
  });
});