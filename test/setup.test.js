import sinon from "sinon";
import { beforeEach, afterEach } from "mocha";
import { testResetGlean } from "@mozilla/glean/testing";

import { isCurrentTabValidUrlScheme } from "../src/shared/backgroundScripts/validTab.js";

/* global global */

// Mock the chrome and browser API for each of the fields we use.
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
    onChanged: {
      addListener: sinon.stub(),
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
    getManifest: sinon.stub(),
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

// Many getters and setters to mimic storage and currnet tab url
export const setIsFirefoxDefault = (isFirefoxDefault) => {
  global.browser.storage.sync.get.callsFake((key, callback) => {
    callback({ isFirefoxDefault });
  });
};

export const setIsFirefoxInstalled = (isFirefoxInstalled) => {
  global.browser.storage.local.get.callsFake((key, callback) => {
    callback({ isFirefoxInstalled });
  });
};

export const setExtensionIsChromium = (isChromium) => {
  global.browser.runtime.getManifest.callsFake(() => {
    if (isChromium) {
      return { minimum_chrome_version: 3 };
    } else {
      return {};
    }
  });
}

export const setIsAutoRedirect = (isAutoRedirect) => {
  global.browser.storage.local.get.callsFake((key, callback) => {
    callback({ isAutoRedirect });
  });
};

export const setExternalSites = (firefoxSites) => {
  global.browser.storage.sync.get.callsFake((key, callback) => {
    callback({ firefoxSites });
  });
};

export const setCurrentTabURL = (currentTabURL) => {
  global.browser.tabs.query.callsFake((queryInfo, callback) => {
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
  global.browser.storage.sync.get.callsFake((key, callback) => {
    callback({ currentExternalBrowser });
  });
};

export const setExternalBrowserLaunchProtocol = (
  currentExternalBrowserLaunchProtocol
) => {
  global.browser.storage.local.get.callsFake((key, callback) => {
    callback({ currentExternalBrowserLaunchProtocol });
  });
};

export const getLocaleMessage = (key) => {
  return locales.default[key].message;
};

// Reset all stubs within our chrome and browser API.
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
  global.browser.i18n.getMessage.callsFake((key) => {
    return getLocaleMessage(key);
  });
});

afterEach(() => {
  resetStubs(global.chrome);
  resetStubs(global.document);
});
