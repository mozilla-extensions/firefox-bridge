// -------------------------------------------
//          Firefox is Installed Logic
// -------------------------------------------
function isFirefoxInstalled() {
  chrome.storage.local.get("isFirefoxInstalled", (result) => {
    if (result.isFirefoxInstalled === undefined) {
      // perform logic to check if Firefox is installed
      chrome.storage.local.set({ isFirefoxInstalled: false }); // placeholder
      return false;
    } else {
      return result.isFirefoxInstalled;
    }
  });
} 

// -------------------------------------------
//          Browser Launching Logic
// -------------------------------------------
let isCurrentTabValidUrlScheme = false;

function checkAndUpdateURLScheme(tab) {
  if (tab.url === undefined) isCurrentTabValidUrlScheme = false;
  else if (tab.url.startsWith("http") || tab.url.startsWith("file")) {
    isCurrentTabValidUrlScheme = true;
  } else {
    isCurrentTabValidUrlScheme = false;
  }
}

function launchFirefox(tab, launchDefaultBrowsing) {
  if (!isFirefoxInstalled()) {
    chrome.tabs.create({ url: "https://www.mozilla.org/firefox/" });
    return;
  }

  if (isCurrentTabValidUrlScheme) {
    if (launchDefaultBrowsing) {
      chrome.tabs.update(tab.id, { url: "firefox:" + tab.url });
    } else {
      chrome.tabs.update(tab.id, { url: "firefox-private:" + tab.url });
    }
  }
}

// -------------------------------------------
//            Context Menu Logic
// -------------------------------------------
function initContextMenu(isFirefoxDefault) {
  // action context menu
  chrome.contextMenus.create({
    id: "changeDefaultLaunchContextMenu",
    title: chrome.i18n.getMessage("Always_use_Firefox_Private_Browsing"),
    contexts: ["action"],
    type: "checkbox",
    checked: !isFirefoxDefault,
  });
  chrome.contextMenus.create({
    id: "alternativeLaunchContextMenu",
    title: chrome.i18n.getMessage(
      "Launch_this_page_in_Firefox_Private_Browsing"
    ),
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

function handleContextMenuClick(info, tab, isFirefoxDefault) {
  if (info.menuItemId === "changeDefaultLaunchContextMenu") {
    chrome.contextMenus.update("changeDefaultLaunchContextMenu", {
      type: "checkbox",
      checked: isFirefoxDefault,
    });
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
    updateToolbarIcon(isFirefoxDefault);
  } else if (info.menuItemId === "alternativeLaunchContextMenu") {
    // launch in the opposite mode to the default
    launchFirefox(tab, !isFirefoxDefault);
  } else if (
    info.menuItemId === "launchInFirefox" ||
    info.menuItemId === "launchInFirefoxLink"
  ) {
    launchFirefox(tab, true);
  } else if (
    info.menuItemId === "launchInFirefoxPrivate" ||
    info.menuItemId === "launchInFirefoxPrivateLink"
  ) {
    launchFirefox(tab, false);
  }
}

// -------------------------------------------
//            Toolbar Icon Logic
// -------------------------------------------
function updateToolbarIcon(isFirefoxDefault) {
  let iconPath = isFirefoxDefault
    ? {
      32: "images/firefox32.png",
    }
    : {
      32: "images/private32.png",
    };
  if (!isCurrentTabValidUrlScheme) {
    iconPath = isFirefoxDefault
      ? {
        32: "images/firefox32grey.png",
      }
      : {
        32: "images/private32grey.png",
      };
  }

  chrome.action.setIcon({ path: iconPath });
}

// -------------------------------------------
//              Hotkey Logic
// -------------------------------------------
function handleHotkeyPress(command, tab) {
  if (command === "launchFirefox") {
    launchFirefox(tab, true);
  } else if (command === "launchFirefoxPrivate") {
    launchFirefox(tab, false);
  }
}

// -------------------------------------------
//             Event Listeners
// -------------------------------------------
async function getIsFirefoxDefault() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["isFirefoxDefault"], (result) => {
      if (result.isFirefoxDefault === undefined) {
        resolve(true);
      } else {
        resolve(result.isFirefoxDefault);
      }
    });
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  handleContextMenuClick(info, tab, await getIsFirefoxDefault());
});

chrome.runtime.onInstalled.addListener(async () => {
  isFirefoxInstalled(); // call this to let the welcome page know if Firefox is installed
  chrome.tabs.create({ url: "pages/welcomePage/welcome.html" });
  const isFirefoxDefault = await getIsFirefoxDefault();
  initContextMenu(isFirefoxDefault);
  updateToolbarIcon(isFirefoxDefault);
});

chrome.storage.sync.onChanged.addListener(async (changes) => {
  if (changes.isFirefoxDefault !== undefined) {
    updateToolbarIcon(await getIsFirefoxDefault());
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  launchFirefox(tab, await getIsFirefoxDefault());
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  checkAndUpdateURLScheme(tab);
  updateToolbarIcon(await getIsFirefoxDefault());
});

chrome.tabs.onCreated.addListener(async (tab) => {
  checkAndUpdateURLScheme(tab);
  updateToolbarIcon(await getIsFirefoxDefault());
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    checkAndUpdateURLScheme(tab);
    updateToolbarIcon(await getIsFirefoxDefault());
  });
});

chrome.commands.onCommand.addListener((command) => {
  console.log("Command:", command);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    handleHotkeyPress(command, tabs[0]);
  });
});

// -------------------------------------------
//              Exports
// -------------------------------------------
chrome.launchFirefox = launchFirefox;
chrome.checkAndUpdateURLScheme = checkAndUpdateURLScheme;
chrome.updateToolbarIcon = updateToolbarIcon;
chrome.handleHotkeyPress = handleHotkeyPress;
chrome.initContextMenu = initContextMenu;
chrome.handleContextMenuClick = handleContextMenuClick;
chrome.getIsFirefoxDefault = getIsFirefoxDefault;
chrome.setIsCurrentTabValidUrlScheme = (value) => {
  isCurrentTabValidUrlScheme = value;
};
chrome.getIsCurrentTabValidUrlScheme = () => {
  return isCurrentTabValidUrlScheme;
};
