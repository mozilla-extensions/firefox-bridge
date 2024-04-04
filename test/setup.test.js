import "@babel/preset-env";
import { testInitializeGlean } from "@mozilla/glean/testing";
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
  extension: {
    inIncognitoContext: false,
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
    session: {
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
    sendNativeMessage: jest.fn(),
    setUninstallURL: jest.fn(),
  },
  action: {
    setIcon: jest.fn(),
    onClicked: {
      addListener: jest.fn(),
    },
    enable: jest.fn(),
    disable: jest.fn(),
  },
  browserAction: {
    setIcon: jest.fn(),
    onClicked: {
      addListener: jest.fn(),
    },
    enable: jest.fn(),
    disable: jest.fn(),
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
  declarativeContent: {
    onPageChanged: {
      addRules: jest.fn(),
      removeRules: jest.fn(),
    },
    PageStateMatcher: jest.fn(),
    ShowAction: jest.fn(),
  },
  webNavigation: {
    onCommitted: {
      addListener: jest.fn(),
    },
  },
  experiments: {
    firefox_bridge: {
      getAvailableBrowsers: jest.fn(),
      getDefaultBrowser: jest.fn(),
      launchBrowser: jest.fn(),
      getTelemetryID: jest.fn(),
    },
  },
};

global.document = {
  addEventListener: jest.fn(),
};

global.navigator = {
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
};

export const setSyncStorage = async (key, keyValue) => {
  let data = {};
  if (global.browser.storage.sync.get.mock) {
    data = (await global.browser.storage.sync.get()) || {};
  }
  data[key] = keyValue;
  jest.spyOn(global.browser.storage.sync, "get").mockImplementation(() => {
    return new Promise((resolve) => {
      resolve(data);
    });
  });
};

export const setLocalStorage = async (key, keyValue) => {
  let data = {};
  if (global.browser.storage.local.get.mock) {
    data = (await global.browser.storage.local.get()) || {};
  }
  data[key] = keyValue;
  jest.spyOn(global.browser.storage.local, "get").mockImplementation(() => {
    return new Promise((resolve) => {
      resolve(data);
    });
  });
};

export const setSessionStorage = async (key, keyValue) => {
  let data = {};
  if (global.browser.storage.session.get.mock) {
    data = (await global.browser.storage.session.get()) || {};
  }
  data[key] = keyValue;
  jest.spyOn(global.browser.storage.session, "get").mockImplementation(() => {
    return new Promise((resolve) => {
      resolve(data);
    });
  });
};
export const setStorage = async (key, keyValue, storageLocation) => {
  if (storageLocation === "sync") {
    await setSyncStorage(key, keyValue);
  } else if (storageLocation === "local") {
    await setLocalStorage(key, keyValue);
  } else if (storageLocation === "session") {
    await setSessionStorage(key, keyValue);
  } else {
    await setSyncStorage(key, keyValue);
    await setLocalStorage(key, keyValue);
    await setSessionStorage(key, keyValue);
  }
};

export const setExtensionPlatform = (platform) => {
  global.IS_FIREFOX_EXTENSION = platform === "firefox";
  global.IS_CHROME_EXTENSION = platform === "chromium";
};

export const setCurrentTab = (tabObject) => {
  const browserTabsQueryMock = jest.spyOn(global.browser.tabs, "query");
  browserTabsQueryMock.mockImplementation(() => {
    return new Promise((resolve) => {
      resolve([tabObject]);
    });
  });
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

await testInitializeGlean("firefox-bridge", false);

beforeEach(async () => {
  await setStorage("isFirefoxInstalled", true, "session");
  setExtensionPlatform("firefox");
});

afterEach(async () => {
  resetStubs(global.browser);
  resetStubs(global.document);
});
