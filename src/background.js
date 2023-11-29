// -------- Initialization ------
let isCurrentTabValidUrlScheme = false;

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

// ------ Icon ------
function updateToolbarIcon(isFirefoxDefault) {
  let iconPath = isFirefoxDefault ?
    {
      32: "images/firefox32.png",
    } :
    {
      32: "images/private32.png",
    };
  if (!isCurrentTabValidUrlScheme) {
    iconPath = isFirefoxDefault?
      {
        32: "images/firefox32grey.png",
      } :
      {
        32: "images/private32grey.png",
      };
  }

  chrome.action.setIcon({path: iconPath});
}

// ------ Context Menu ------
function initContextMenu(isFirefoxDefault) {
  // action context menu
  chrome.contextMenus.create({
    id: "changeDefaultLaunchContextMenu",
    title: "Always use Firefox Private Browsing",
    contexts: ["action"],
    type: "checkbox",
    checked: !isFirefoxDefault,
  });
  chrome.contextMenus.create({
    id: "alternativeLaunchContextMenu",
    title: "Launch this page in Firefox Private Browsing",
    contexts: ["action"],
  });

  // page context menu
  chrome.contextMenus.create({
    id: "launchInFirefox",
    title: "Launch this page in Firefox",
    contexts: ["page"],
  });
  chrome.contextMenus.create({
    id: "launchInFirefoxPrivate",
    title: "Launch this page in Firefox Private Browsing",
    contexts: ["page"],
  });

  chrome.contextMenus.create({
    id: "launchInFirefoxLink",
    title: "Launch this link in Firefox",
    contexts: ["link"],
  });
  chrome.contextMenus.create({
    id: "launchInFirefoxPrivateLink",
    title: "Launch this link in Firefox Private Browsing",
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
        title: "Launch this page in Firefox",
      });
    } else {
      chrome.contextMenus.update("alternativeLaunchContextMenu", {
        title: "Launch this page in Firefox Private Browsing",
      });
    }
    chrome.storage.sync.set({isFirefoxDefault: !isFirefoxDefault});
    updateToolbarIcon(isFirefoxDefault);
  } else if (info.menuItemId === "alternativeLaunchContextMenu") {
    // launch in the opposite mode to the default
    launchFirefox(tab, !isFirefoxDefault);
  } else if (info.menuItemId === "launchInFirefox" || info.menuItemId === "launchInFirefoxLink") {
    launchFirefox(tab, true);
  } else if (info.menuItemId === "launchInFirefoxPrivate" || info.menuItemId === "launchInFirefoxPrivateLink") {
    launchFirefox(tab, false);
  }
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  handleContextMenuClick(info, tab, await getIsFirefoxDefault());
});

// ------ Installation ------
chrome.runtime.onInstalled.addListener(async () => {
  const isFirefoxDefault = await getIsFirefoxDefault();
  initContextMenu(isFirefoxDefault);
  updateToolbarIcon(isFirefoxDefault);
});

// ------ Storage listeners ------
chrome.storage.sync.onChanged.addListener(async (changes) => {
  if (changes.isFirefoxDefault !== undefined) {
    updateToolbarIcon(await getIsFirefoxDefault());
  }
});

// ------ Launching Firefox ------
function launchFirefox(tab, launchDefaultBrowsing) {
  if (isCurrentTabValidUrlScheme) {
    if (launchDefaultBrowsing) {
      chrome.tabs.update(tab.id, {url: "firefox:" + tab.url});
    } else {
      chrome.tabs.update(tab.id, {url: "firefox-private:" + tab.url});
    }
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  launchFirefox(tab, await getIsFirefoxDefault());
});

// ------ Grey Icon Logic --------
function checkAndUpdateURLScheme(tab) {
  if (tab.url === undefined) isCurrentTabValidUrlScheme = false;
  else if (tab.url.startsWith("http") || tab.url.startsWith("file")) {
    isCurrentTabValidUrlScheme = true;
  } else {
    isCurrentTabValidUrlScheme = false;
  }
}

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


// ------ Exports ------
if (chrome.isTestEnv) {
  chrome.initContextMenu = initContextMenu;
  chrome.handleContextMenuClick = handleContextMenuClick;
  chrome.launchFirefox = launchFirefox;
  chrome.checkAndUpdateURLScheme = checkAndUpdateURLScheme;
  chrome.updateToolbarIcon = updateToolbarIcon;
  chrome.setIsCurrentTabValidUrlScheme = (value) => {
    isCurrentTabValidUrlScheme = value;
  };
  chrome.getIsCurrentTabValidUrlScheme = () => {
    return isCurrentTabValidUrlScheme;
  };
}