import "@babel/preset-env";
import { testResetGlean } from "@mozilla/glean/testing";
import { isCurrentTabValidUrlScheme } from "../src/shared/backgroundScripts/validTab.js";
import locales from "../src/_locales/en/messages.json";
import jest from "jest-mock";

/* global global */

// Mock the chrome and browser API for each of the fields we use.
global.browser = {
  testEnv: true,
  contextMenus: {
    create: jest.fn(),
    update: jest.fn(),
    onClicked: {
      addListener: jest.fn(),
    },
  },
  storage: {
    sync: {
      get: jest.fn(),
      onChanged: {
        addListener: jest.fn(),
      },
      set: jest.fn(),
    },
    local: {
      get: jest.fn(),
      set: jest.fn(),
      onChanged: {
        addListener: jest.fn(),
      },
    },
    onChanged: {
      addListener: jest.fn(),
    },
  },
  runtime: {
    id: "test",
    onInstalled: {
      addListener: jest.fn(),
    },
    getURL: jest.fn(),
    onStartup: {
      addListener: jest.fn(),
    },
    getManifest: jest.fn(),
  },
  action: {
    setIcon: jest.fn(),
    onClicked: {
      addListener: jest.fn(),
    },
  },
  browserAction: {
    setIcon: jest.fn(),
    onClicked: {
      addListener: jest.fn(),
    },
  },
  tabs: {
    onUpdated: {
      addListener: jest.fn(),
    },
    onActivated: {
      addListener: jest.fn(),
    },
    onCreated: {
      addListener: jest.fn(),
    },
    update: jest.fn(),
    create: jest.fn(),
    query: jest.fn(),
  },
  commands: {
    onCommand: {
      addListener: jest.fn(),
    },
  },
  i18n: {
    getMessage: jest.fn(),
  },
  webRequest: {
    onBeforeRequest: {
      addListener: jest.fn(),
    },
  },
  declarativeNetRequest: {
    updateDynamicRules: jest.fn(),
    getDynamicRules: jest.fn(),
  },
  experiments: {
    firefox_launch: {
      getAvailableBrowsers: jest.fn(),
      getDefaultBrowser: jest.fn(),
      launchApp: jest.fn(),
    },
  },
};

global.document = {
  addEventListener: jest.fn(),
};

export const setSyncStorage = (key, keyValue) => {
  jest.spyOn(global.browser.storage.sync, "get").mockImplementation(() => {
    return new Promise((resolve) => {
      resolve({ [key]: keyValue });
    });
  });
};

export const setLocalStorage = (key, keyValue) => {
  jest.spyOn(global.browser.storage.local, "get").mockImplementation(() => {
    return new Promise((resolve) => {
      resolve({ [key]: keyValue });
    });
  });
};

export const setStorage = (key, keyValue, storageLocation) => {
  if (storageLocation === "sync") {
    setSyncStorage(key, keyValue);
  } else if (storageLocation === "local") {
    setLocalStorage(key, keyValue);
  } else {
    setSyncStorage(key, keyValue);
    setLocalStorage(key, keyValue);
  }
};

export const setExtensionPlatform = (platform) => {
  global.IS_FIREFOX_EXTENSION = platform === "firefox";
  global.IS_CHROME_EXTENSION = platform === "chromium";
};

export const setCurrentTabURL = (currentTabURL) => {
  const browserTabsQueryMock = jest.spyOn(global.browser.tabs, "query");
  browserTabsQueryMock.mockImplementation(() => {
    return new Promise((resolve) => {
      resolve([
        {
          url: currentTabURL,
        },
      ]);
    });
  });
};

export const getIsCurrentTabValidUrlScheme = () => {
  return isCurrentTabValidUrlScheme;
};

export const getLocaleMessage = (key) => {
  return locales[key].message;
};

// Reset all stubs within our chrome and browser API.
function resetStubs(obj) {
  for (const prop in obj) {
    if (typeof obj[prop] === "object") {
      resetStubs(obj[prop]);
    } else if (obj[prop].mockClear) {
      obj[prop].mockClear();
    }
  }
}

jest.spyOn(global.browser.i18n, "getMessage").mockImplementation((key) => {
  return getLocaleMessage(key);
});

beforeEach(async () => {
  await testResetGlean("firefox-launch");
  setStorage("isFirefoxInstalled", true);

});

afterEach(() => {
  resetStubs(global.browser);
  resetStubs(global.document);
});
