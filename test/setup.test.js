import sinon from "sinon";
import { beforeEach, afterEach } from "mocha";
import { testResetGlean } from "@mozilla/glean/testing";

import { isCurrentTabValidUrlScheme } from "../src/shared/backgroundScripts/validTab.js";

/* global global */
global.chrome = {
  testEnv: true,
  contextMenus: {
    create: sinon.stub(),
    update: sinon.stub(),
    onClicked: {
      addListener: sinon.stub(),
    },
  },
  storage: {
    sync: {
      get: sinon.stub(),
      onChanged: {
        addListener: sinon.stub(),
      },
      set: sinon.stub(),
    },
    local: {
      get: sinon.stub(),
      set: sinon.stub(),
      onChanged: {
        addListener: sinon.stub(),
      },
    },
  },
  runtime: {
    id: "test",
    onInstalled: {
      addListener: sinon.stub(),
    },
    getURL: sinon.stub(),
    onStartup: {
      addListener: sinon.stub(),
    },
  },
  action: {
    setIcon: sinon.stub(),
    onClicked: {
      addListener: sinon.stub(),
    },
  },
  tabs: {
    onUpdated: {
      addListener: sinon.stub(),
    },
    onActivated: {
      addListener: sinon.stub(),
    },
    onCreated: {
      addListener: sinon.stub(),
    },
    update: sinon.stub(),
    create: sinon.stub(),
    query: sinon.stub(),
  },
  commands: {
    onCommand: {
      addListener: sinon.stub(),
    },
  },
  i18n: {
    getMessage: sinon.stub(),
  },
  webRequest: {
    onBeforeRequest: {
      addListener: sinon.stub(),
    },
  },
  declarativeNetRequest: {
    updateDynamicRules: sinon.stub(),
    getDynamicRules: sinon.stub(),
  },
};

global.document = {
  addEventListener: sinon.stub(),
};

global.browser = global.chrome;
global.browser.experiments = {
  firefox_launch: {
    getAvailableBrowsers: sinon.stub(),
    getDefaultBrowser: sinon.stub(),
    launchApp: sinon.stub(),
  },
};

const locales = await import("../src/_locales/en/messages.json", {
  assert: { type: "json" },
});

export const setIsFirefoxDefault = (isFirefoxDefault) => {
  global.chrome.storage.sync.get.callsFake((key, callback) => {
    callback({ isFirefoxDefault });
  });
};

export const setIsFirefoxInstalled = (isFirefoxInstalled) => {
  global.chrome.storage.local.get.callsFake((key, callback) => {
    callback({ isFirefoxInstalled });
  });
};

export const setIsAutoRedirect = (isAutoRedirect) => {
  global.chrome.storage.local.get.callsFake((key, callback) => {
    callback({ isAutoRedirect });
  });
};

export const setExternalSites = (firefoxSites) => {
  global.chrome.storage.sync.get.callsFake((key, callback) => {
    callback({ firefoxSites });
  });
};

export const setCurrentTabURL = (currentTabURL) => {
  global.chrome.tabs.query.callsFake((queryInfo, callback) => {
    callback([
      {
        url: currentTabURL,
      },
    ]);
  });
};

export const getIsCurrentTabValidUrlScheme = () => {
  return isCurrentTabValidUrlScheme;
};

export const setExternalBrowser = (currentExternalBrowser) => {
  global.chrome.storage.sync.get.callsFake((key, callback) => {
    callback({ currentExternalBrowser });
  });
};

export const setExternalBrowserLaunchProtocol = (
  currentExternalBrowserLaunchProtocol
) => {
  global.chrome.storage.local.get.callsFake((key, callback) => {
    callback({ currentExternalBrowserLaunchProtocol });
  });
};

export const getLocaleMessage = (key) => {
  return locales.default[key].message;
};

function resetStubs(obj) {
  for (const prop in obj) {
    if (typeof obj[prop] === "object") {
      resetStubs(obj[prop]);
    } else if (obj[prop].reset) {
      obj[prop].reset();
    }
  }
}

beforeEach(async () => {
  await testResetGlean("firefox-launch");
  setIsFirefoxInstalled(true);
  global.chrome.i18n.getMessage.callsFake((key) => {
    return getLocaleMessage(key);
  });
});

afterEach(() => {
  resetStubs(global.chrome);
  resetStubs(global.document);
});
