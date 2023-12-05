// -------------------------------------------
//          Firefox is Installed Logic
// -------------------------------------------
function getIsFirefoxInstalled() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["isFirefoxInstalled"], (result) => {
      if (result.isFirefoxInstalled === undefined) {
        chrome.storage.local.set({ isFirefoxInstalled: true });
        resolve(true);
      } else {
        resolve(result.isFirefoxInstalled);
      }
    });
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

async function launchFirefox(tab, launchDefaultBrowsing) {
  if (! await getIsFirefoxInstalled()) {
    chrome.tabs.create({ url: "https://www.mozilla.org/firefox/" });
    return false;
  }

  if (isCurrentTabValidUrlScheme) {
    if (launchDefaultBrowsing) {
      chrome.tabs.update(tab.id, { url: "firefox:" + tab.url });
    } else {
      chrome.tabs.update(tab.id, { url: "firefox-private:" + tab.url });
    }
    return true;
  }
  return false;
}

// -------------------------------------------
//            Context Menu Logic
// -------------------------------------------
async function initContextMenu() {
  // action context menu
  chrome.contextMenus.create({
    id: "changeDefaultLaunchContextMenu",
    title: chrome.i18n.getMessage("Always_use_Firefox_Private_Browsing"),
    contexts: ["action"],
    type: "checkbox",
    checked: !await getIsFirefoxDefault(),
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

async function handleContextMenuClick(info, tab) {
  const isFirefoxDefault = await getIsFirefoxDefault();
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
    updateToolbarIcon();
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
  }
}

// -------------------------------------------
//            Toolbar Icon Logic
// -------------------------------------------
async function updateToolbarIcon() {
  let iconPath = await getIsFirefoxDefault()
    ? {
      32: "images/firefox32.png",
    }
    : {
      32: "images/private32.png",
    };
  if (!isCurrentTabValidUrlScheme) {
    iconPath = await getIsFirefoxDefault()
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
async function handleHotkeyPress(command, tab) {
  if (command === "launchFirefox") {
    await launchFirefox(tab, true);
  } else if (command === "launchFirefoxPrivate") {
    await launchFirefox(tab, false);
  }
}

// -------------------------------------------
//             Event Listeners
// -------------------------------------------
function getIsFirefoxDefault() {
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

chrome.contextMenus.onClicked.addListener((info, tab) => {
  handleContextMenuClick(info, tab);
});

chrome.runtime.onInstalled.addListener(async () => {
  await getIsFirefoxInstalled(); // call this to let the welcome page know if Firefox is installed
  chrome.tabs.create({ url: "pages/welcomePage/welcome.html" });
  await initContextMenu();
  await updateToolbarIcon();
});

chrome.storage.sync.onChanged.addListener((changes) => {
  if (changes.isFirefoxDefault !== undefined) {
    updateToolbarIcon();
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  launchFirefox(tab, await getIsFirefoxDefault());
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  checkAndUpdateURLScheme(tab);
  updateToolbarIcon();
});

chrome.tabs.onCreated.addListener((tab) => {
  checkAndUpdateURLScheme(tab);
  updateToolbarIcon();
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    checkAndUpdateURLScheme(tab);
    updateToolbarIcon();
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
chrome.getIsFirefoxInstalled = getIsFirefoxInstalled;
chrome.setIsCurrentTabValidUrlScheme = (value) => {
  isCurrentTabValidUrlScheme = value;
};
chrome.getIsCurrentTabValidUrlScheme = () => {
  return isCurrentTabValidUrlScheme;
};
