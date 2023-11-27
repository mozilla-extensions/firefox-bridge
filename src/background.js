// -------- Initialization ------
let isFirefoxDefault = true;
let isCurrentTabValidUrlScheme = false;

function setIsFirefoxDefault(value) {
  isFirefoxDefault = value;
  chrome.storage.sync.set({isFirefoxDefault: value});
}

chrome.storage.sync.get(["isFirefoxDefault"], (result) => {
  if (result.isFirefoxDefault === undefined) {
    setIsFirefoxDefault(true);
  } else {
    setIsFirefoxDefault(result.isFirefoxDefault);
  }
});

// ------ Icon ------
function updateToolbarIcon() {
  let iconPath = isFirefoxDefault ?
    {
      32: "images/firefox32.png",
    } :
    {
      32: "images/private32.png",
    };
  if (!isCurrentTabValidUrlScheme) {
    iconPath = isFirefoxDefault ?
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
function initContextMenu() {
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
  updateToolbarIcon();
}

function handleContextMenuClick(info, tab) {
  if (info.menuItemId === "changeDefaultLaunchContextMenu") {
    chrome.contextMenus.update("changeDefaultLaunchContextMenu", {
      type: "checkbox",
      checked: isFirefoxDefault,
    });
    setIsFirefoxDefault(!isFirefoxDefault);
    if (isFirefoxDefault) {
      chrome.contextMenus.update("alternativeLaunchContextMenu", {
        title: "Launch this page in Firefox Private Browsing",
      });
    } else {
      chrome.contextMenus.update("alternativeLaunchContextMenu", {
        title: "Launch this page in Firefox",
      });
    }
    updateToolbarIcon();
  } else if (info.menuItemId === "alternativeLaunchContextMenu") {
    launchFirefox(tab, !isFirefoxDefault);
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  handleContextMenuClick(info, tab);
});

// ------ Installation ------
chrome.runtime.onInstalled.addListener(() => {
  initContextMenu();
});

// ------ Storage listeners ------
chrome.storage.sync.onChanged.addListener((changes) => {
  if (changes.isFirefoxDefault !== undefined) {
    setIsFirefoxDefault(changes.isFirefoxDefault.newValue);
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

chrome.action.onClicked.addListener((tab) => {
  launchFirefox(tab, isFirefoxDefault);
});

// ------ Grey Icon Logic --------
function checkAndUpdateURLScheme(tab) {
  if (tab.url === undefined) isCurrentTabValidUrlScheme = false;
  else if (tab.url.startsWith("http") || tab.url.startsWith("file")) {
    isCurrentTabValidUrlScheme = true;
  } else {
    isCurrentTabValidUrlScheme = false;
  }
  updateToolbarIcon();
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  checkAndUpdateURLScheme(tab);
});

chrome.tabs.onCreated.addListener((tab) => {
  checkAndUpdateURLScheme(tab);
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    checkAndUpdateURLScheme(tab);
  });
});


// ------ Exports ------
if (chrome.isTestEnv) {
  chrome.initContextMenu = initContextMenu;
  chrome.handleContextMenuClick = handleContextMenuClick;
  chrome.setIsFirefoxDefault = setIsFirefoxDefault;
  chrome.launchFirefox = launchFirefox;
  chrome.checkAndUpdateURLScheme = checkAndUpdateURLScheme;
  chrome.updateToolbarIcon = updateToolbarIcon;
  chrome.setIsCurrentTabValidUrlScheme = (value) => {
    isCurrentTabValidUrlScheme = value;
  };
  chrome.getIsFirefoxDefault = () => {
    return isFirefoxDefault;
  };
  chrome.getIsCurrentTabValidUrlScheme = () => {
    return isCurrentTabValidUrlScheme;
  };
}